// @flow
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Branch";
import Branch, { LEFT, opposite, RIGHT } from "./Branch";
import Depth from "./Depth";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";

type NodesByName = Map<string, LeafNode>;

type Event = {
  altKey: boolean,
  shiftKey: boolean
};

export default class Diagram {
  alluvialRoot = new AlluvialRoot();
  streamlineNodesById: Map<string, StreamlineNode> = new Map();
  networksById: Map<string, NodesByName> = new Map();
  networkIndices: string[] = [];
  dirty: boolean = true;
  _asObject: Object = {};

  constructor(networks: Network[]) {
    networks.forEach(network => this.addNetwork(network));
  }

  addNetwork(network: Network) {
    const { nodes, id, name } = network;

    if (this.networksById.has(id)) {
      throw new Error(`Network with id ${id} already exists`);
    }

    const nodesByName = new Map(
      nodes.map(node => [node.name, new LeafNode(node, id)])
    );

    this.networkIndices.push(id);
    this.networksById.set(id, nodesByName);
    this.alluvialRoot.createNetworkRoot(id, name);

    for (let node of nodesByName.values()) {
      this.addNode(node, id);
    }
  }

  removeNetwork(networkId: string) {
    const networkIndex = this.networkIndices.indexOf(networkId);
    const nodesByName = this.networksById.get(networkId);

    if (networkIndex === -1 || nodesByName == null) {
      console.warn(`No network exists with id ${networkId}`);
      return;
    }

    for (let node of nodesByName.values()) {
      this.removeNode(node);
    }

    this.networkIndices.splice(networkIndex, 1);
    this.networksById.delete(networkId);
  }

  hasNetwork(networkId: string): boolean {
    return this.networksById.has(networkId);
  }

  doubleClick(alluvialNode: Object, event: Event) {
    const { shiftKey, altKey } = event;
    if (alluvialNode.depth === Depth.MODULE) {
      const regroupOrExpand = (shiftKey
        ? this.regroupModule
        : this.expandModule
      ).bind(this);

      const ids = altKey ? this.networkIndices : [alluvialNode.networkId];
      ids.forEach(id => regroupOrExpand(alluvialNode.moduleId, id));
    }
  }

  calcLayout(
    totalWidth: number,
    height: number,
    streamlineFraction: number,
    maxModuleWidth: number
  ) {
    this.dirty = true;

    const numNetworks = this.networkIndices.length;

    if (!numNetworks) return;

    const width = Math.min(
      totalWidth / (numNetworks + (numNetworks - 1) * streamlineFraction),
      maxModuleWidth
    );
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
      (node, i, children) => {
        switch (node.depth) {
          case Depth.NETWORK_ROOT:
            currentFlowThreshold = node.flowThreshold;
            networkTotalMargins.push(0);
            node.sortChildren();
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            node.sortChildren();
            let margin = 0;
            const next = i + 1 !== children.length ? children[i + 1] : null;
            if (next) {
              let differenceIndex = 0;
              let minLength = Math.min(node.path.length, next.path.length);
              for (let j = 0; j < minLength; j++) {
                if (node.path[j] === next.path[j]) continue;
                differenceIndex = j;
                break;
              }
              margin = 2 ** (5 - differenceIndex);
            }
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

    const maxTotalMargin = Math.max(...networkTotalMargins);
    let usableHeight = height - maxTotalMargin;
    const maxMarginFractionOfHeight = 0.5;
    const marginFractionOfHeight = maxTotalMargin / height;

    if (marginFractionOfHeight > maxMarginFractionOfHeight) {
      // Reduce margins to below 50% of vertical space
      // Use moduleMarginScale such that
      //   moduleMarginScale * maxTotalMargin / height == maxMarginFractionOfHeight
      const moduleMarginScale =
        (maxMarginFractionOfHeight * height) / maxTotalMargin;

      this.alluvialRoot.forEachDepthFirstWhile(
        node => node.depth <= Depth.MODULE,
        node => {
          if (node.depth === Depth.MODULE) {
            node.margin *= moduleMarginScale;
          }
        }
      );

      const scaledTotalMargin = maxTotalMargin * moduleMarginScale;
      usableHeight = height - scaledTotalMargin;
    }

    for (let node of this.alluvialRoot.traverseDepthFirstWhile(
      node => node.depth <= Depth.BRANCH
    )) {
      switch (node.depth) {
        case Depth.NETWORK_ROOT:
          currentFlowThreshold = node.flowThreshold;
          break;
        case Depth.BRANCH:
          node.sortChildren(currentFlowThreshold);
          break;
        default:
          break;
      }
    }

    x = 0;
    y = height;

    // We can't set this in the loop any more because of post order traversal
    const networkRoot = this.alluvialRoot.getNetworkRoot(
      this.networkIndices[0]
    );
    currentFlowThreshold = networkRoot
      ? networkRoot.flowThreshold
      : currentFlowThreshold;

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
          node.layout = { x, y: 0, width, height };
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
    if (this.dirty) {
      this._asObject = this.alluvialRoot.asObject();
      this.dirty = false;
    }
    return this._asObject;
  }

  addNode(node: LeafNode, networkId: string, moduleLevel: number = 1) {
    node.moduleLevel = moduleLevel;

    const root: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!root) {
      console.warn(`No network id ${networkId}`);
      return;
    }

    const module = root.getOrCreateModule(node, moduleLevel);
    const group = module.getOrCreateGroup(node.highlightIndex);

    this.alluvialRoot.flow += node.flow;
    root.flow += node.flow;
    module.flow += node.flow;
    group.flow += node.flow;

    for (let branch of group) {
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
      const oppositeStreamlineNode = streamlineNode.getOppositeStreamlineNode();
      if (oppositeStreamlineNode) {
        this.streamlineNodesById.delete(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling();

        const duplicate = this.streamlineNodesById.get(
          oppositeStreamlineNode.id
        );

        // Does the (new) dangling id already exist? Move nodes from it.
        // Note: as we move nodes around we don't need to propagate flow.
        if (duplicate) {
          duplicate.children.forEach((node: LeafNode) => {
            oppositeStreamlineNode.addChild(node);
            oppositeStreamlineNode.flow += node.flow;
            node.setParent(oppositeStreamlineNode, opposite(side));
          });

          const oppositeBranch: ?Branch = oppositeStreamlineNode.parent;
          if (!oppositeBranch) {
            throw new Error("No parent found for opposite streamline node");
          }
          oppositeBranch.removeChild(duplicate);
        }

        this.streamlineNodesById.set(
          oppositeStreamlineNode.id,
          oppositeStreamlineNode
        );
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

  regroupModule(moduleId: string, networkId: string) {
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

    if (module.moduleLevel <= 1) {
      console.warn(
        `Module with id ${moduleId} is already at module level ${
          module.moduleLevel
        }`
      );
      return;
    }

    const modules = networkRoot.getSiblings(moduleId);

    const leafNodes = [].concat.apply(
      [],
      modules.map(module => [...module.leafNodes()])
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = module.moduleLevel - 1;
    leafNodes.forEach(node => this.removeNode(node));
    leafNodes.forEach(node => this.addNode(node, networkId, newModuleLevel));
  }

  getNodeByName(networkId: string, name: string): ?LeafNode {
    const nodesByName = this.networksById.get(networkId);
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
