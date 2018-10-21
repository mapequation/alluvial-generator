// @flow
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Branch";
import Branch, { LEFT, opposite, RIGHT } from "./Branch";
import Depth from "./depth-constants";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import StreamlineNode from "./StreamlineNode";
import StreamlineId from "./StreamlineId";

type NodesByName = Map<string, LeafNode>;

export default class Diagram {
  alluvialRoot = new AlluvialRoot();
  streamlineNodesById: Map<string, StreamlineNode> = new Map();
  nodesByNetworkId: Map<string, NodesByName> = new Map();
  networkIndices: string[] = [];

  constructor(networks: Network[]) {
    networks.forEach(network => this.addNodes(network));
  }

  addNodes(network: Network) {
    const { nodes, id } = network;

    const nodesByName = new Map(
      nodes.map(node => [node.name, new LeafNode(node, id)])
    );

    this.networkIndices.push(id);
    this.nodesByNetworkId.set(id, nodesByName);

    for (let node of nodesByName.values()) {
      this.addNode(node, id);
    }
  }

  doubleClick(alluvialNode: Object) {
    switch (alluvialNode.depth) {
      case Depth.MODULE:
        this.expandModule(alluvialNode.moduleId, alluvialNode.networkId);
        break;
      default:
        break;
    }
  }

  calcLayout(totalWidth: number, height: number, streamlineFraction: number) {
    const numNetworks = this.networkIndices.length;
    const width =
      totalWidth / (numNetworks + (numNetworks - 1) * streamlineFraction);
    const streamlineWidth = streamlineFraction * width;
    const networkWidth = width + streamlineWidth;

    let x = 0;
    let y = height;

    let currentFlowThreshold = 0.0;

    const networkTotalMargins = [];

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.alluvialRoot.forEachDepthFirstPreOrderWhile(
      node =>
        node.depth < Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= currentFlowThreshold),
      (node, i) => {
        switch (node.depth) {
          case Depth.NETWORK_ROOT:
            currentFlowThreshold = node.flowThreshold;
            networkTotalMargins.push(0);
            node.sortChildren();
            node.layout = { x, y, width, height: node.flow * height };
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            const next = node.parent.getChild(i + 1);
            const margin = next
              ? Math.min(next.getDefaultMargin(), node.getDefaultMargin())
              : 0;
            node.margin = margin;
            y -= node.flow * height;
            node.layout = { x, y, width, height: node.flow * height };
            y -= margin;
            networkTotalMargins[networkTotalMargins.length - 1] += margin;
            break;
          default:
            break;
        }
      }
    );

    let maxTotalMargin = Math.max(...networkTotalMargins);
    let usableHeight = Math.max(height - maxTotalMargin, 0);

    if (usableHeight === 0) {
      console.warn("Usable height is 0");
    }

    let moduleMarginScale = 1.0;
    const maxMarginFractionOfSpace = 0.5;

    if (maxTotalMargin / height > maxMarginFractionOfSpace) {
      // Reduce margins to below 50% of vertical space
      // Use moduleMarginScale such that
      //   moduleMarginScale * maxTotalMargin / height == maxMarginFractionOfSpace
      moduleMarginScale = (maxMarginFractionOfSpace * height) / maxTotalMargin;

      this.alluvialRoot.forEachDepthFirstWhile(
        node => node.depth <= Depth.MODULE,
        node => {
          if (node.depth === Depth.MODULE) {
            node.margin *= moduleMarginScale;
          }
        }
      );

      maxTotalMargin *= moduleMarginScale;
      usableHeight = height - maxTotalMargin;
      console.log(
        `Scaling margin by ${moduleMarginScale} -> totalMargin: ${maxTotalMargin}, usableHeight: ${usableHeight}`
      );
    }

    for (let node of this.alluvialRoot.traverseDepthFirstWhile(
      node => node.depth <= Depth.BRANCH
    )) {
      if (node.depth === Depth.BRANCH) {
        node.sortChildren();
      }
    }

    x = 0;
    y = height;

    // We can't set this in the loop any more because of post order traversal
    const first = this.networkIndices[0];
    currentFlowThreshold = this.alluvialRoot.getNetworkRoot(first)
      .flowThreshold;

    for (let node of this.alluvialRoot.traverseDepthFirstPostOrderWhile(
      node =>
        node.depth !== Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= currentFlowThreshold)
    )) {
      switch (node.depth) {
        case Depth.ALLUVIAL_ROOT:
          node.layout = { x: 0, y: 0, width: totalWidth, height };
          break;
        case Depth.NETWORK_ROOT:
          x += networkWidth;
          y = height;
          break;
        case Depth.MODULE:
          node.layout = { x, y, width, height: node.flow * usableHeight };
          y -= node.margin;
          break;
        case Depth.HIGHLIGHT_GROUP:
          node.layout = { x, y, width, height: node.flow * usableHeight };
          break;
        case Depth.BRANCH:
          node.layout = { x, y, width, height: node.flow * usableHeight };
          if (node.isLeft) {
            y += node.flow * usableHeight;
          }
          break;
        case Depth.STREAMLINE_NODE:
          y -= node.flow * usableHeight;
          node.layout = { x, y, width, height: node.flow * usableHeight };
          break;
        default:
          break;
      }
    }
  }

  asObject(): Object {
    return this.alluvialRoot.asObject();
  }

  addNode(node: LeafNode, networkId: string, moduleLevel: number = 1) {
    node.moduleLevel = moduleLevel;

    const root = this.alluvialRoot.getOrCreateNetworkRoot(node, networkId);
    const module = root.getOrCreateModule(node, moduleLevel);
    const group = module.getOrCreateGroup(node, node.highlightIndex);

    this.alluvialRoot.flow += node.flow;
    root.flow += node.flow;
    module.flow += node.flow;
    group.flow += node.flow;

    for (let branch of group.children) {
      branch.flow += node.flow;

      const oppositeNode = this.getOppositeNode(node, branch.side);

      const streamlineId = StreamlineId.create(
        node,
        branch.side,
        oppositeNode
      ).toString();
      let streamlineNode = this.streamlineNodesById.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(networkId, branch, streamlineId);
        this.streamlineNodesById.set(streamlineId, streamlineNode);
        branch.addChild(streamlineNode);
      }

      if (streamlineNode.hasTarget()) {
        const oppositeStreamlineIsDangling = this.streamlineNodesById.has(
          streamlineNode.targetId
        );
        if (oppositeStreamlineIsDangling && oppositeNode) {
          const oppositeSide = opposite(branch.side);
          this.removeNodeFromSide(oppositeNode, oppositeSide);
          this.addNodeToSide(oppositeNode, oppositeSide);
        } else {
          throw new Error(
            "Streamline node for the opposite node must be dangling " +
              "before it has has this node to connect to."
          );
        }
      }

      streamlineNode.addChild(node);
      streamlineNode.flow += node.flow;
      node.setParent(streamlineNode, branch.side);
    }
  }

  addNodeToSide(node: LeafNode, side: Side) {
    const { networkId } = node;

    const oppositeNode: ?LeafNode = this.getOppositeNode(node, side);

    const streamlineId = StreamlineId.create(
      node,
      side,
      oppositeNode
    ).toString();
    let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(
      streamlineId
    );

    const oldStreamlineNode: ?StreamlineNode = node.getParent(side);
    if (!oldStreamlineNode) {
      console.warn(`Node ${node.name} has no parent on side ${side}`);
      return;
    }
    const branch: ?Branch = oldStreamlineNode.parent;

    if (!streamlineNode) {
      if (!branch) {
        console.warn(
          `Streamline node with id ${oldStreamlineNode.id} has no parent`
        );
        return;
      }

      streamlineNode = new StreamlineNode(networkId, branch, streamlineId);
      this.streamlineNodesById.set(streamlineId, streamlineNode);
      branch.addChild(streamlineNode);

      if (oppositeNode) {
        const oppositeId = StreamlineId.oppositeId(streamlineId);
        const oppositeStreamlineNode = this.streamlineNodesById.get(oppositeId);

        if (oppositeStreamlineNode) {
          streamlineNode.linkTo(oppositeStreamlineNode);
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
    // No need to remove branches here

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
    if (!streamlineNode) {
      console.warn(`Leaf node ${node.name} has no parent on side ${side}`);
      return;
    }
    streamlineNode.removeChild(node);
    streamlineNode.flow -= node.flow;

    const branch: ?Branch = streamlineNode.parent;
    if (!branch) {
      console.warn(
        `Streamline node with id ${streamlineNode.id} has no parent`
      );
      return;
    }
    branch.flow -= node.flow;

    if (streamlineNode.isEmpty) {
      const opposite = streamlineNode.getOppositeStreamlineNode();
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

  expandModule(moduleId: string, networkId: string) {
    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(
      networkId
    );
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return;
    }

    const module: ?Module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(
        `No module found with id ${moduleId} in network ${networkId}`
      );
      return;
    }

    const leafNodes: LeafNode[] = Array.from(module.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = module.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(node => node.level < newModuleLevel);
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
          `because some nodes are at level ${newModuleLevel - 1}`
      );
      return;
    }

    leafNodes.forEach(node => this.removeNode(node));
    leafNodes.forEach(node => this.addNode(node, networkId, newModuleLevel));
  }

  getNodeByName(networkId: string, name: string): ?LeafNode {
    const nodesByName = this.nodesByNetworkId.get(networkId);
    if (!nodesByName) return;
    return nodesByName.get(name);
  }

  getNeighborNetworkId(networkId: string, side: Side): ?string {
    const networkIndex = this.networkIndices.indexOf(networkId);
    if (networkIndex === -1) return;
    const neighborNetworkIndex = networkIndex + side;
    if (
      neighborNetworkIndex < 0 ||
      neighborNetworkIndex === this.networkIndices.length
    )
      return;
    return this.networkIndices[neighborNetworkIndex];
  }

  getOppositeNode(node: LeafNode, side: Side): ?LeafNode {
    const neighborNetworkId = this.getNeighborNetworkId(node.networkId, side);

    return neighborNetworkId
      ? this.getNodeByName(neighborNetworkId, node.name)
      : null;
  }
}
