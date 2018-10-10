// @flow
import sortBy from "lodash/sortBy";

import type { FTree } from "../io/parse-ftree";
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Branch";
import Branch, { LEFT, opposite, RIGHT } from "./Branch";
import Depth from "./depth-constants";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class Diagram {
    alluvialRoot = new AlluvialRoot();
    networks: FTree[] = [];
    streamlineNodesById: Map<string, StreamlineNode> = new Map();
    nodesByName: Map<string, LeafNode>[] = [];

    constructor(networks: FTree[]) {
        networks.forEach(network => this.addNetwork(network));
    }

    addNetwork(network: FTree) {
        const { data: { nodes } } = network;
        const networkIndex = this.networks.length;

        this.networks.push(network);
        const nodesByName = new Map(nodes.map(node => [node.name, new LeafNode(node, networkIndex)]));

        this.nodesByName.push(nodesByName);

        for (let node of nodesByName.values()) {
            this.addNode(node, networkIndex);
        }
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
                case Depth.ALLUVIAL_ROOT:
                    node.layout = { x: 0, y: 0, width, height };
                    break;
                case Depth.NETWORK_ROOT:
                    x += networkWidth;
                    y = height;
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case Depth.MODULE:
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case Depth.HIGHLIGHT_GROUP:
                    node.layout = { x, y: y - node.flow * height, width: barWidth, height: node.flow * height };
                    break;
                case Depth.BRANCH:
                    node.children = sortBy(node.children, [n => n.byLink, n => n.byFlow]);
                    if (node.isRight) {
                        y += node.flow * height;
                    }
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    break;
                case Depth.STREAMLINE_NODE:
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

    addNode(node: LeafNode, networkIndex: number, moduleLevel: number = 1) {
        node.moduleLevel = moduleLevel;

        const root = this.alluvialRoot.getOrCreateNetworkRoot(node, networkIndex);
        const module = root.getOrCreateModule(node, moduleLevel);
        const group = module.getOrCreateGroup(node, node.highlightIndex);

        this.alluvialRoot.flow += node.flow;
        root.flow += node.flow;
        module.flow += node.flow;
        group.flow += node.flow;

        const { left, right } = group;

        for (let branch of [left, right]) {
            branch.flow += node.flow;

            const oppositeNode: ?LeafNode = this.getNodeByName(branch.neighborNetworkIndex, node.name);
            const streamlineId = StreamlineNode.createId(node, networkIndex, moduleLevel, branch.side, oppositeNode);
            let streamlineNode = this.streamlineNodesById.get(streamlineId);

            if (!streamlineNode) {
                streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
                this.streamlineNodesById.set(streamlineId, streamlineNode);
                branch.addChild(streamlineNode);

                // connect streamline nodes with a link if possible
                const [sourceId, targetId] = streamlineId.split("--");
                if (targetId) {
                    // check if we already have an opposite streamline
                    const oppositeId = [sourceId, targetId].reverse().join("--");
                    const oppositeStreamlineNode = this.streamlineNodesById.get(oppositeId);
                    // create link
                    if (oppositeStreamlineNode) {
                        const reverseLinkDirection = branch.isLeft;
                        StreamlineLink.create(streamlineNode, oppositeStreamlineNode, reverseLinkDirection);
                    } else if (oppositeNode) {
                        // opposite streamline node is dangling but should be connected
                        this.removeNodeFromSide(oppositeNode, opposite(branch.side));
                        this.addNodeToSide(oppositeNode, opposite(branch.side));
                    }
                }
            } else if (oppositeNode) {
                // remove and re-add oppositeNode if oppositeStreamline is dangling
                const [_, targetId] = streamlineId.split("--");
                if (targetId) {
                    const oppositeStreamlineNode = this.streamlineNodesById.get(targetId);
                    if (oppositeStreamlineNode) {
                        // opposite streamline node is dangling but should be connected
                        this.removeNodeFromSide(oppositeNode, opposite(branch.side));
                        this.addNodeToSide(oppositeNode, opposite(branch.side));
                    }
                }
            }

            streamlineNode.addChild(node);
            streamlineNode.flow += node.flow;
            node.setParent(streamlineNode, branch.side);
        }
    }

    addNodeToSide(node: LeafNode, side: Side) {
        const { networkIndex, moduleLevel } = node;
        const neighborNetworkIndex = networkIndex + side;

        const oppositeNode: ?LeafNode = this.getNodeByName(neighborNetworkIndex, node.name);
        const streamlineId = StreamlineNode.createId(node, networkIndex, moduleLevel, side, oppositeNode);
        let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(streamlineId);
        console.log(networkIndex, streamlineId);

        const oldStreamlineNode: StreamlineNode = node.getParent(side);
        if (!oldStreamlineNode) return console.log("no old sl");
        const branch: ?Branch = oldStreamlineNode.parent;

        if (!streamlineNode) {
            console.log("no streamline");
            if (!branch) return console.log("no branch");
            streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
            this.streamlineNodesById.set(streamlineId, streamlineNode);
            branch.addChild(streamlineNode);
        }

        streamlineNode.addChild(node);
        streamlineNode.flow += node.flow;
        node.setParent(streamlineNode, side);
    }

    removeNode(node: LeafNode) {
        this.removeNodeFromSide(node, LEFT);
        const group = this.removeNodeFromSide(node, RIGHT);
        if (group) this.removeFromGroup(node, group);
    }

    removeNodeFromSide(node: LeafNode, side: Side): ?HighlightGroup {
        const streamlineNode = node.getParent(side);
        if (!streamlineNode) return;
        streamlineNode.removeChild(node);
        streamlineNode.flow -= node.flow;

        const branch: ?Branch = streamlineNode.parent;
        if (!branch) return;
        branch.flow -= node.flow;

        if (streamlineNode.isEmpty) {
            const opposite = streamlineNode.oppositeStreamlineNode;
            if (opposite) {
                this.streamlineNodesById.delete(opposite.id);
                opposite.makeDangling();
                this.streamlineNodesById.set(opposite.id, opposite);
            } else {
                this.streamlineNodesById.delete(streamlineNode.id);
            }
            if (streamlineNode.link) {
                streamlineNode.link.remove();
            }

            branch.removeChild(streamlineNode);
        }

        return branch.parent;
    }

    removeFromGroup(node: LeafNode, group: HighlightGroup) {
        group.flow -= node.flow;
        // no need to remove branches here

        const module: ?Module = group.parent;
        if (!module) return;
        module.flow -= node.flow;

        if (group.isEmpty) {
            module.removeChild(group);
        }

        const networkRoot: ?NetworkRoot = module.parent;
        if (!networkRoot) return;
        networkRoot.flow -= node.flow;

        if (module.isEmpty) {
            networkRoot.removeChild(module);
        }

        this.alluvialRoot.flow -= node.flow;

        if (networkRoot.isEmpty) {
            this.alluvialRoot.removeChild(networkRoot);
        }
    }

    getNodeByName(networkIndex: number, name: string): ?LeafNode {
        if (networkIndex < 0 || networkIndex >= this.networks.length) return null;
        return this.nodesByName[networkIndex].get(name);
    }
}
