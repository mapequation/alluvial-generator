// @flow
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Branch";
import Branch, { LEFT, opposite, RIGHT, sideToString } from "./Branch";
import Depth from "./Depth";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";


type Event = {
  altKey: boolean,
  shiftKey: boolean
};

const noKeyModifiers: Event = {
  altKey: false,
  shiftKey: false,
};

type VerticalAlign = "bottom" | "justify" | "top";

const differenceIndex = (array1, array2) => {
  let differenceIndex = 0;
  const minLength = Math.min(array1.length, array2.length);
  for (let i = 0; i < minLength; i++) {
    if (array1[i] === array2[i]) continue;
    differenceIndex = i;
    break;
  }
  return differenceIndex;
};

export default class Diagram {
  alluvialRoot = new AlluvialRoot();
  streamlineNodesById: Map<string, StreamlineNode> = new Map();
  dirty: boolean = true;
  _asObject: Object = {};

  constructor(networks: Network[]) {
    networks.forEach(network => this.addNetwork(network));
  }

  addNetwork(network: Network) {
    const { nodes, id, codelength, name } = network;

    if (this.alluvialRoot.hasNetwork(id)) {
      throw new Error(`Network with id ${id} already exists`);
    }

    const networkRoot = this.alluvialRoot.createNetworkRoot(id, name, codelength);

    const leafNodes = nodes.map(node => new LeafNode(node, id));
    networkRoot.createLeafNodeToNameMap(leafNodes);

    this.addNodes(leafNodes, id);
  }

  removeNetwork(networkId: string) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network exists with id ${networkId}`);
      return;
    }

    this.removeNodes(networkRoot.leafNodes());
  }

  doubleClick(alluvialNode: Object, event: Event = noKeyModifiers) {
    const { shiftKey, altKey } = event;
    if (alluvialNode.depth === Depth.MODULE) {
      const regroupOrExpand = (shiftKey
          ? this.regroupModule
          : this.expandModule
      ).bind(this);

      const networkIds = altKey ? this.alluvialRoot.networkIds : [alluvialNode.networkId];
      networkIds.forEach(networkId => regroupOrExpand(alluvialNode.moduleId, networkId));
    }
  }

  setModuleName(id: string, name: ?string) {
    const module = this.getModuleById(id);
    if (!module) return;
    module.name = name;
    this.dirty = true;
  }

  calcLayout(
    totalWidth: number,
    height: number,
    streamlineFraction: number,
    maxModuleWidth: number,
    flowThreshold: number,
    verticalAlign: VerticalAlign = "bottom",
  ) {
    this.dirty = true;

    const numNetworks = this.alluvialRoot.numChildren;

    if (!numNetworks) return;

    const width = Math.min(
      totalWidth / (numNetworks + (numNetworks - 1) * streamlineFraction),
      maxModuleWidth,
    );
    const streamlineWidth = streamlineFraction * width;
    const networkWidth = width + streamlineWidth;

    let x = 0;
    let y = height;

    const totalMargins = new Array(numNetworks).fill(0);
    const visibleFlows = new Array(numNetworks).fill(0);
    const visibleModules = new Array(numNetworks).fill(0);
    let networkIndex = 0;

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.alluvialRoot.forEachDepthFirstPreOrderWhile(
      node =>
        node.depth < Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= flowThreshold),
      (node, i, nodes) => {
        switch (node.depth) {
          case Depth.NETWORK_ROOT:
            node.flowThreshold = flowThreshold;
            networkIndex = i;
            node.sortChildren();
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            node.sortChildren();
            const margin =
              i + 1 < nodes.length
                ? 2 ** (5 - differenceIndex(node.path, nodes[i + 1].path))
                : 0;
            y -= node.flow * height;
            node.margin = margin;
            node.layout = { x, y, width, height: node.flow * height };
            y -= margin;
            totalMargins[networkIndex] += margin;
            visibleFlows[networkIndex] += node.flow;
            visibleModules[networkIndex]++;
            break;
          default:
            break;
        }
      },
    );

    const maxTotalMargin = Math.max(...totalMargins);
    let usableHeight = height - maxTotalMargin;

    const maxMarginFractionOfHeight = 0.5;
    const marginFractionOfHeight = maxTotalMargin / height;

    if (marginFractionOfHeight > maxMarginFractionOfHeight) {
      // Reduce margins to below 50% of vertical space
      // Use moduleMarginScale such that
      //   moduleMarginScale * maxTotalMargin / height == maxMarginFractionOfHeight
      const moduleMarginScale = (maxMarginFractionOfHeight * height) / maxTotalMargin;

      this.alluvialRoot.forEachDepthFirstWhile(
        node => node.depth <= Depth.MODULE,
        node => {
          if (node.depth === Depth.MODULE) {
            node.margin *= moduleMarginScale;
          }
        },
      );

      const scaledTotalMargin = maxTotalMargin * moduleMarginScale;
      usableHeight = height - scaledTotalMargin;
    }

    if (verticalAlign === "justify") {
      let totalMargin = maxTotalMargin;
      let visibleFlow = Math.max(...visibleFlows);
      let missingFlow = 0;
      let missingMargin = 0;
      let numMargins = 0;

      this.alluvialRoot.forEachDepthFirstWhile(
        node =>
          node.depth < Depth.MODULE ||
          (node.depth === Depth.MODULE && node.flow >= flowThreshold),
        (node, i) => {
          if (node.depth === Depth.NETWORK_ROOT) {
            totalMargin = totalMargins[i];
            numMargins = visibleModules[i] - 1;
            visibleFlow = visibleFlows[i];
            missingFlow = 1 - visibleFlow;
            missingMargin = missingFlow * usableHeight;
          } else if (node.depth === Depth.MODULE && node.margin > 0) {
            node.margin *= maxTotalMargin / totalMargin;
            if (numMargins > 0) {
              node.margin += missingMargin / numMargins;
            }
          }
        },
      );
    }

    this.alluvialRoot.forEachDepthFirstWhile(
      node => node.depth <= Depth.BRANCH,
      node => {
        if (node.depth === Depth.BRANCH) {
          node.sortChildren(flowThreshold);
        }
      },
    );

    x = 0;
    y = height;

    this.alluvialRoot.forEachDepthFirstPostOrderWhile(
      node =>
        node.depth !== Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= flowThreshold),
      node => {
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
      },
    );
  }

  asObject(): Object {
    if (this.dirty) {
      this._asObject = this.alluvialRoot.asObject();
      this.dirty = false;
    }
    return this._asObject;
  }

  addNodes(nodes: Iterable<LeafNode>, networkId: string, moduleLevel: number = 1) {
    for (let node of nodes) {
      this.addNode(node, networkId, moduleLevel);
    }
  }

  addNode(node: LeafNode, networkId: string, moduleLevel: number = 1) {
    node.moduleLevel = moduleLevel;

    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return;
    }

    this.alluvialRoot.flow += node.flow;
    networkRoot.flow += node.flow;

    const moduleId = node.ancestorAtLevel(moduleLevel);
    const module = networkRoot.getOrCreateModule(moduleId, moduleLevel);
    const group = module.getOrCreateGroup(node.highlightIndex);

    module.flow += node.flow;
    group.flow += node.flow;

    for (let branch of group) {
      branch.flow += node.flow;

      const oppositeNode = this.getOppositeNode(node, branch.side);

      const streamlineId = StreamlineId.create(node, branch.side, oppositeNode);
      let streamlineNode = this.streamlineNodesById.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(networkId, branch, streamlineId);
        this.streamlineNodesById.set(streamlineId, streamlineNode);
        branch.addChild(streamlineNode);
      }

      if (streamlineNode.hasTarget) {
        const oppositeStreamlineIsDangling = this.streamlineNodesById.has(streamlineNode.targetId);
        if (oppositeStreamlineIsDangling && oppositeNode) {
          const oppositeSide = opposite(branch.side);
          this.removeNodeFromSide(oppositeNode, oppositeSide);
          this.addNodeToSide(oppositeNode, oppositeSide);
        } else {
          throw new Error(
            "Streamline node for the opposite node must be dangling " +
            "before it has has this node to connect to.",
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

    const streamlineId = StreamlineId.create(node, side, oppositeNode);
    let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(streamlineId);

    const oldStreamlineNode: ?StreamlineNode = node.getParent(side);
    if (!oldStreamlineNode) {
      console.warn(`Node ${node.id} has no ${sideToString[side]} parent`);
      return;
    }
    const branch: ?Branch = oldStreamlineNode.parent;

    if (!streamlineNode) {
      if (!branch) {
        console.warn(`Streamline node with id ${oldStreamlineNode.id} has no parent`);
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

  removeNodes(nodes: Iterable<LeafNode>) {
    for (let node of nodes) {
      this.removeNode(node);
    }
  }

  removeNode(node: LeafNode) {
    this.removeNodeFromSide(node, LEFT);
    const group = this.removeNodeFromSide(node, RIGHT);

    if (!group) {
      console.warn(`Node ${node.id} was removed without belonging to a group.`);
      return;
    }
    group.flow -= node.flow;
    // No need to remove branches here

    const module: ?Module = group.parent;
    if (!module) {
      console.warn(`Node ${node.id} was removed without belonging to a module.`);
      return;
    }
    module.flow -= node.flow;

    if (group.isEmpty) {
      group.removeFromParent();
    }

    const networkRoot: ?NetworkRoot = module.parent;
    if (!networkRoot) {
      console.warn(`Node ${node.id} was removed without belonging to a network root.`);
      return;
    }
    networkRoot.flow -= node.flow;

    if (module.isEmpty) {
      module.removeFromParent();
    }

    this.alluvialRoot.flow -= node.flow;

    if (networkRoot.isEmpty) {
      networkRoot.removeFromParent();
    }
  }

  removeNodeFromSide(node: LeafNode, side: Side): ?HighlightGroup {
    const streamlineNode = node.getParent(side);
    if (!streamlineNode) {
      console.warn(`Node ${node.id} has no ${sideToString[side]} parent`);
      return;
    }
    streamlineNode.removeChild(node);
    streamlineNode.flow -= node.flow;

    const branch: ?Branch = streamlineNode.parent;
    if (!branch) {
      console.warn(`Streamline node with id ${streamlineNode.id} has no parent`);
      return;
    }
    branch.flow -= node.flow;

    if (streamlineNode.isEmpty) {
      const oppositeStreamlineNode = streamlineNode.getOppositeStreamlineNode();
      if (oppositeStreamlineNode) {
        this.streamlineNodesById.delete(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling();

        const duplicate = this.streamlineNodesById.get(oppositeStreamlineNode.id);

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
          duplicate.removeFromParent();
        }

        this.streamlineNodesById.set(
          oppositeStreamlineNode.id,
          oppositeStreamlineNode,
        );
      }

      this.streamlineNodesById.delete(streamlineNode.id);

      if (streamlineNode.link) {
        streamlineNode.link.remove();
      }

      streamlineNode.removeFromParent();
    }

    return branch.parent;
  }

  expandModule(moduleId: string, networkId: string) {
    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(
      networkId,
    );
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return;
    }

    const module: ?Module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return;
    }

    const leafNodes: LeafNode[] = Array.from(module.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = module.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(node => node.level <= newModuleLevel);
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
        `because some nodes are at level ${newModuleLevel - 1}`,
      );
      return;
    }

    this.removeNodes(leafNodes);
    this.addNodes(leafNodes, networkId, newModuleLevel);
  }

  regroupModule(moduleId: string, networkId: string) {
    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return;
    }

    const module: ?Module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return;
    }

    if (module.moduleLevel <= 1) {
      console.warn(`Module with id ${moduleId} is already at module level ${module.moduleLevel}`);
      return;
    }

    const modules = networkRoot.getSiblings(moduleId);

    const leafNodes = [].concat.apply(
      [],
      modules.map(module => [...module.leafNodes()]),
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = module.moduleLevel - 1;
    this.removeNodes(leafNodes);
    this.addNodes(leafNodes, networkId, newModuleLevel);
  }

  getNodeByName(networkId: string, name: string): ?LeafNode {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`Cannot get node because no network exists with id ${networkId}`);
      return;
    }

    return networkRoot.getLeafNodeByName(name);
  }

  getModuleById(id: string): ?Module {
    const [networkId, moduleId] = id.split("_module");
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    return networkRoot.getModule(moduleId);
  }

  getOppositeNode(node: LeafNode, side: Side): ?LeafNode {
    const neighborNetworkId = this.alluvialRoot.getNeighborNetworkId(node.networkId, side);

    return neighborNetworkId
      ? this.getNodeByName(neighborNetworkId, node.name)
      : null;
  }
}
