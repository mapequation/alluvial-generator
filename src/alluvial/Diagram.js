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

type Network = Node[];

export default class Diagram {
  alluvialRoot = new AlluvialRoot();
  numNetworks: number = 0;
  streamlineNodesById: Map<string, StreamlineNode> = new Map();
  nodesByName: Map<string, LeafNode>[] = [];

  constructor(networks: Network[]) {
    networks.forEach(nodes => this.addNodes(nodes));
  }

  addNodes(nodes: Node[]) {
    const networkIndex = this.numNetworks++;

    const nodesByName = new Map(
      nodes.map(node => [node.name, new LeafNode(node, networkIndex)])
    );

    this.nodesByName.push(nodesByName);

    for (let node of nodesByName.values()) {
      this.addNode(node, networkIndex);
    }
  }

  doubleClick(alluvialNode: Object) {
    switch (alluvialNode.depth) {
      case Depth.MODULE:
        this.expandModule(alluvialNode.moduleId, alluvialNode.networkIndex);
        break;
      default:
        break;
    }
  }

  calcLayout(width: number, height: number, streamlineFraction: number) {
    const barWidth =
      width / (this.numNetworks + (this.numNetworks - 1) * streamlineFraction);
    const streamlineWidth = streamlineFraction * barWidth;
    const networkWidth = barWidth + streamlineWidth;

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
            node.layout = { x, y, width: barWidth, height: node.flow * height };
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            const next = node.parent.getChild(i + 1);
            const margin = next ? Math.min(next.margin, node.margin) : 0;
            node.margin = margin;
            y -= node.flow * height;
            node.layout = { x, y, width: barWidth, height: node.flow * height };
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
      const forEachUntilModules = this.alluvialRoot.createForEachDepthFirstWhileIterator(
        node => node.depth <= Depth.MODULE
      );

      forEachUntilModules(node => {
        if (node.depth === Depth.MODULE) {
          node.margin *= moduleMarginScale;
        }
      });
      maxTotalMargin *= moduleMarginScale;
      usableHeight = height - maxTotalMargin;
      console.log(
        `Scaling margin by ${moduleMarginScale} -> totalMargin: ${maxTotalMargin}, usableHeight: ${usableHeight}`
      );
    }

    x = 0;
    y = height;

    // We can't set this in the loop any more because of post order traversal
    currentFlowThreshold = this.alluvialRoot.getNetworkRoot(0).flowThreshold;

    for (let node of this.alluvialRoot.traverseDepthFirstPostOrderWhile(
      node =>
        node.depth !== Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= currentFlowThreshold)
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
          node.layout = {
            x,
            y,
            width: barWidth,
            height: node.flow * usableHeight
          };
          y -= node.margin;
          break;
        case Depth.HIGHLIGHT_GROUP:
          node.layout = {
            x,
            y,
            width: barWidth,
            height: node.flow * usableHeight
          };
          break;
        case Depth.BRANCH:
          node.sortChildren();
          node.layout = {
            x,
            y,
            width: barWidth,
            height: node.flow * usableHeight
          };
          if (node.isLeft) {
            y += node.flow * usableHeight;
          }
          break;
        case Depth.STREAMLINE_NODE:
          y -= node.flow * usableHeight;
          node.layout = {
            x,
            y,
            width: barWidth,
            height: node.flow * usableHeight
          };
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

      const oppositeNode: ?LeafNode = this.getNodeByName(
        branch.neighborNetworkIndex,
        node.name
      );
      const streamlineId = StreamlineId.create(
        node,
        networkIndex,
        branch.side,
        oppositeNode
      ).toString();
      let streamlineNode = this.streamlineNodesById.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
        this.streamlineNodesById.set(streamlineId, streamlineNode);
        branch.addChild(streamlineNode);
      }

      const streamlineIdHasTarget = !!streamlineNode.targetId;

      if (streamlineIdHasTarget) {
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
    const { networkIndex } = node;
    const neighborNetworkIndex = networkIndex + side;

    const oppositeNode: ?LeafNode = this.getNodeByName(
      neighborNetworkIndex,
      node.name
    );
    const streamlineId = StreamlineId.create(
      node,
      networkIndex,
      side,
      oppositeNode
    ).toString();
    let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(
      streamlineId
    );

    const oldStreamlineNode: ?StreamlineNode = node.getParent(side);
    if (!oldStreamlineNode) return;
    const branch: ?Branch = oldStreamlineNode.parent;

    if (!streamlineNode) {
      if (!branch) return;

      streamlineNode = new StreamlineNode(networkIndex, branch, streamlineId);
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
    if (!streamlineNode) return;
    streamlineNode.removeChild(node);
    streamlineNode.flow -= node.flow;

    const branch: ?Branch = streamlineNode.parent;
    if (!branch) return;
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

  expandModule(moduleId: string, networkIndex: number) {
    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(
      networkIndex
    );
    if (!networkRoot) {
      console.warn(`No network index ${networkIndex}`);
      return;
    }

    const module: ?Module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(
        `No module found with id ${moduleId} in network ${networkIndex}`
      );
      return;
    }

    const leafNodes: LeafNode[] = Array.from(module.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const moduleLevel = leafNodes[0].moduleLevel;

    leafNodes.forEach(node => this.removeNode(node));
    leafNodes.forEach(node =>
      this.addNode(node, networkIndex, moduleLevel + 1)
    );
  }

  getNodeByName(networkIndex: number, name: string): ?LeafNode {
    if (networkIndex < 0 || networkIndex >= this.nodesByName.length)
      return null;
    return this.nodesByName[networkIndex].get(name);
  }
}
