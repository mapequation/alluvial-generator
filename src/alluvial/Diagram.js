// @flow
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

    click(alluvialNode: Object) {
        console.log("Click:", alluvialNode, "flow:", alluvialNode.flow);
    }

    doubleClick(alluvialNode: Object) {
        switch (alluvialNode.depth) {
            case Depth.MODULE:
                this.expandModule(alluvialNode.id, alluvialNode.networkIndex);
                break;
            default:
                break;
        }
    }

    calcLayout(width: number, height: number, moduleMargin: number, streamlineFraction: number) {
        const numNetworks = this.networks.length;
        const barWidth = width / (numNetworks + (numNetworks - 1) * streamlineFraction);
        const streamlineWidth = streamlineFraction * barWidth;
        const networkWidth = barWidth + streamlineWidth;

        const moduleMargins = [20, 10, 6, 3, 2];
        let moduleMarginScale = 1.0;
        const getModuleMargin = (level: number) => {
            if (level - 1 > moduleMargins.length) return 2;
            return moduleMargins[level - 1];
        }

        let currentFlowThreshold = 0.0;
        let x = 0;
        let y = height;
        const networkMargins = [];

        // Use first pass to get order of modules to sort streamlines in second pass
        // Y position of modules will be tuned in second pass depending on max margins
        this.alluvialRoot.forEachDepthFirstPreOrderWhile(node => 
            node.depth < Depth.MODULE ||
            (node.depth === Depth.MODULE && node.flow >= currentFlowThreshold),
            (node, i, children, next) => {
            switch (node.depth) {
                case Depth.NETWORK_ROOT:
                    currentFlowThreshold = node.flowThreshold;
                    networkMargins.push(0);
                    node.sortChildren();
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    if (i > 0) {
                        x += networkWidth;
                    }
                    y = height;
                    break;
                case Depth.MODULE:
                    const margin = next ? getModuleMargin(Math.min(next.moduleLevel, node.moduleLevel)) : 0;
                    node.marginTop = margin;
                    y -= node.flow * height;
                    node.layout = { x, y, width: barWidth, height: node.flow * height };
                    y -= margin;
                    networkMargins[networkMargins.length - 1] += margin;
                    break;
                default:
                    break;
            }
        });


        let totalMargin = Math.max(...networkMargins);
        let usableHeight = height - totalMargin;
        currentFlowThreshold = this.alluvialRoot.getNetworkRoot(0).flowThreshold;
        x = 0;
        y = height;
        console.log(`totalMargin: ${totalMargin}, usableHeight: ${usableHeight}, height: ${height}`);

        const maxMarginFractionOfSpace = 0.5;
        if (totalMargin / height > maxMarginFractionOfSpace) {
            // Reduce margins to below 50% of vertical space
            // Use moduleMarginScale such that 
            //   moduleMarginScale * totalMargin / height == maxMarginFractionOfSpace
            moduleMarginScale = maxMarginFractionOfSpace * height / totalMargin;
            for (let module of this.alluvialRoot.traverseDepthFirst()) {
                module.marginTop *=  moduleMarginScale;
            }
            totalMargin *= moduleMarginScale;
            usableHeight = height - totalMargin;
            console.log(`Scaling margin by ${moduleMarginScale} -> totalMargin: ${totalMargin}, usableHeight: ${usableHeight}`);
        }

        
        for (let node of this.alluvialRoot.traverseDepthFirstPostOrderWhile(node =>
            node.depth !== Depth.MODULE ||
            (node.depth === Depth.MODULE && node.flow >= currentFlowThreshold),
        )) {
            switch (node.depth) {
            case Depth.ALLUVIAL_ROOT:
                node.layout = { x: 0, y: 0, width, height };
                break;
            case Depth.NETWORK_ROOT:
                x += networkWidth;
                y = height;
                break;
            case Depth.MODULE:
                node.layout = { x, y, width: barWidth, height: node.flow * usableHeight };
                y -= node.marginTop;
                break;
            case Depth.HIGHLIGHT_GROUP:
                node.layout = { x, y, width: barWidth, height: node.flow * usableHeight };
                break;
            case Depth.BRANCH:
                node.sortChildren(); // Sort streamline nodes
                node.layout = { x, y, width: barWidth, height: node.flow * usableHeight };
                if (node.isLeft) {
                    y += node.flow * usableHeight;
                }
                break;
            case Depth.STREAMLINE_NODE:
                y -= node.flow * usableHeight;
                node.layout = { x, y, width: barWidth, height: node.flow * usableHeight };
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
            const streamlineId = StreamlineNode.createId(node, networkIndex, branch.side, oppositeNode);
            let streamlineNode = this.streamlineNodesById.get(streamlineId);

            if (!streamlineNode) {
                streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
                this.streamlineNodesById.set(streamlineId, streamlineNode);
                branch.addChild(streamlineNode);
            }

            const [_, targetId] = streamlineId.split("--"); // eslint-disable-line no-unused-vars
            const streamlineIdHasTarget = !!targetId;

            if (streamlineIdHasTarget) {
                const oppositeStreamlineIsDangling = this.streamlineNodesById.has(targetId);
                if (oppositeStreamlineIsDangling && oppositeNode) {
                    const oppositeSide = opposite(branch.side);
                    this.removeNodeFromSide(oppositeNode, oppositeSide);
                    this.addNodeToSide(oppositeNode, oppositeSide);
                } else {
                    throw new Error("Streamline node for the opposite node must be dangling "
                        + "before it has has this node to connect to.");
                }
            }

            streamlineNode.addChild(node);
            streamlineNode.flow += node.flow;
            node.setParent(streamlineNode, branch.side);
        }
    }

    addNodeToSide(node: LeafNode, side: Side) {
        const { networkIndex } = node;
        const neighborNetworkIndex = networkIndex + side;

        const oppositeNode: ?LeafNode = this.getNodeByName(neighborNetworkIndex, node.name);
        const streamlineId = StreamlineNode.createId(node, networkIndex, side, oppositeNode);
        let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(streamlineId);

        const oldStreamlineNode: StreamlineNode = node.getParent(side);
        if (!oldStreamlineNode) return;
        const branch: ?Branch = oldStreamlineNode.parent;

        if (!streamlineNode) {
            if (!branch) return;

            streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
            this.streamlineNodesById.set(streamlineId, streamlineNode);
            branch.addChild(streamlineNode);

            if (oppositeNode) {
                const oppositeId = streamlineId.split("--").reverse().join("--");
                const oppositeStreamlineNode = this.streamlineNodesById.get(oppositeId);

                if (oppositeStreamlineNode) {
                    const reverseLinkDirection = branch.isLeft;
                    StreamlineLink.create(streamlineNode, oppositeStreamlineNode, reverseLinkDirection);
                }
            }
        }

        if (branch) branch.flow += node.flow;

        streamlineNode.addChild(node);
        streamlineNode.flow += node.flow;
        node.setParent(streamlineNode, side);
    }

    removeNode(node: LeafNode) {
        this.removeNodeFromSide(node, LEFT);
        const group = this.removeNodeFromSide(node, RIGHT);

        if (!group) return;
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
            }

            this.streamlineNodesById.delete(streamlineNode.id);

            if (streamlineNode.link) {
                streamlineNode.link.remove();
            }

            branch.removeChild(streamlineNode);
        }

        return branch.parent;
    }

    expandModule(moduleId: string, networkIndex: number) {
        const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(networkIndex);
        if (!networkRoot) return;
        const module: ?Module = networkRoot.getModule(moduleId);
        if (!module) return;
        console.log('Click on module:', module);
        const leafNodes = Array.from(module.traverseLeafNodes());
        if (leafNodes.length === 0) return;
        const moduleLevel = leafNodes[0].moduleLevel; 
        for (let leafNode of leafNodes) {
            this.removeNode(leafNode);
        }
        for (let leafNode of leafNodes) {
            this.addNode(leafNode, networkIndex, moduleLevel + 1);
        }
    }

    getNodeByName(networkIndex: number, name: string): ?LeafNode {
        if (networkIndex < 0 || networkIndex >= this.networks.length) return null;
        return this.nodesByName[networkIndex].get(name);
    }
}
