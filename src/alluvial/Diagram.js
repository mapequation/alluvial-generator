// @flow
import type { FTree, Node } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import type { Side } from "./Branch";
import { LEFT } from "./Branch";
import Root from "./Root";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class Diagram {
    roots: Root[];
    networks: FTree[];
    streamlinesById: Map<string, StreamlineNode> = new Map();

    constructor(networks: FTree[]) {
        this.roots = networks.map((_, index) => new Root(index));
        this.networks = networks;
        this.addNode(networks[0].data.nodes[0], 0);
        this.addNode(networks[1].data.nodes[0], 1);
    }

    addNode(node: Node, networkIndex: number, moduleLevel: number = 1) {
        const root = this.roots[networkIndex];
        const module = root.getOrCreateModule(node, moduleLevel);
        const group = module.getOrCreateGroup(node, node.highlightIndex);

        root.flow += node.flow;
        module.flow += node.flow;
        group.flow += node.flow;

        const { left, right } = group;

        for (let branch of [left, right]) {
            const oppositeNode = this.getNodeByName(branch.neighborNetworkIndex, node.name);
            const streamlineId = this.getStreamlineNodeId(node, networkIndex, moduleLevel, branch.side, oppositeNode);
            let streamline = this.streamlinesById.get(streamlineId);

            if (!streamline) {
                streamline = new StreamlineNode(networkIndex, streamlineId);
                this.streamlinesById.set(streamlineId, streamline);
                branch.addStreamlineNode(streamline);
                branch.flow += node.flow;

                const oppositeId = streamlineId.split("--").reverse().join("--");
                const oppositeStreamline = this.streamlinesById.get(oppositeId);
                if (oppositeStreamline) {
                    StreamlineLink.create(streamline, oppositeStreamline, branch.side === LEFT);
                }
            }

            streamline.addNode(node);
        }
    }

    getNodeByName(networkIndex: number, name: string): ?Node {
        if (networkIndex < 0 || networkIndex >= this.networks.length) return null;

        return this.networks[networkIndex].data.nodes.find(node => node.name === name);
    }

    getStreamlineNodeId(node: Node,
                        networkIndex: number,
                        moduleLevel: number,
                        side: Side,
                        oppositeNode: ?Node = null): string {

        const moduleId = node => TreePath.ancestorAtLevel(node.path, moduleLevel).toString();
        const typeSuffix = node => `${node.insignificant ? "i" : ""}${node.highlightIndex}`;
        const createId = (networkIndex, node) => `${networkIndex}_m${moduleId(node)}_group${typeSuffix(node)}`;
        const idPair = (id, oppositeId) => `${id}--${oppositeId}`;
        const danglingId = id => `${id}${side === LEFT ? "LEFT" : "RIGHT"}`;

        const id = createId(networkIndex, node);

        if (oppositeNode) {
            const oppositeId = createId(networkIndex + side, oppositeNode);
            return idPair(id, oppositeId);
        }

        return danglingId(id);
    }
}
