// @flow
import sortBy from "lodash/sortBy";

import type { FTree, Node } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Branch";
import { LEFT } from "./Branch";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";



export default class Diagram {
    alluvialRoot = new AlluvialRoot();
    networks: FTree[];
    streamlineNodesById: Map<string, StreamlineNode> = new Map();

    constructor(networks: FTree[]) {
        this.networks = networks;
        this.networks.forEach((network, i) => {
            network.data.nodes.forEach(node => this.addNode(node, i));
        });
        this.calcLayout();
    }

    calcLayout() {
        const height = 600;
        const width = 1200;

        const numNetworks = this.networks.length;
        const streamlineFraction = 2;
        const barWidth = width / (numNetworks + (numNetworks - 1) * streamlineFraction);
        const streamlineWidth = streamlineFraction * barWidth;

        const networkWidth = barWidth + streamlineWidth;

        let x = -networkWidth; // we add this the first time
        let y = height;

        for (let node of this.alluvialRoot.traverseDepthFirst()) {
            switch (node.depth) {
                case 0: // alluvialRoot
                    node.layout = { x: 0, y: 0, width, height };
                    break;
                case 1: //root
                    x += networkWidth;
                    y = height;
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case 2: // module
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case 3: // group
                    node.layout = { x, y: y - node.flow * height, width: barWidth, height: node.flow * height };
                    break;
                case 4: // branch
                    node.children = sortBy(node.children, [n => n.byLink, n => n.byFlow]);
                    if (node.isRight) {
                        // reset height because...
                        y += node.flow * height;
                    }
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case 5: // slnode
                    y -= node.flow * height;
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                default:
                    break;
            }
        }
    }

    asObject(): Object {
        return this.alluvialRoot.asObject();
    }

    addNode(node: Node, networkIndex: number, moduleLevel: number = 1) {
        const root = this.alluvialRoot.getOrCreateNetworkRoot(node, networkIndex);
        const module = root.getOrCreateModule(node, moduleLevel);
        const group = module.getOrCreateGroup(node, node.highlightIndex);

        root.flow += node.flow;
        module.flow += node.flow;
        group.flow += node.flow;

        const { left, right } = group;

        for (let branch of [left, right]) {
            branch.flow += node.flow;
            const oppositeNode = this.getNodeByName(branch.neighborNetworkIndex, node.name);
            const streamlineId = this.getStreamlineNodeId(node, networkIndex, moduleLevel, branch.side, oppositeNode);
            let streamlineNode = this.streamlineNodesById.get(streamlineId);

            if (!streamlineNode) {
                streamlineNode = new StreamlineNode(networkIndex, streamlineId);
                this.streamlineNodesById.set(streamlineId, streamlineNode);
                branch.addStreamlineNode(streamlineNode);

                const [leftId, rightId] = streamlineId.split("--");
                if (rightId) {
                    const oppositeId = [leftId, rightId].reverse().join("--");
                    const oppositeStreamline = this.streamlineNodesById.get(oppositeId);
                    if (oppositeStreamline) {
                        StreamlineLink.create(streamlineNode, oppositeStreamline, branch.side === LEFT);
                    }
                }
            }

            streamlineNode.addNode(node);
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
