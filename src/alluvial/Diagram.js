// @flow
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import Branch from "./Branch";
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

    this.addNodes(leafNodes);
  }

  removeNetwork(networkId: string) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network exists with id ${networkId}`);
      return;
    }

    this.removeNodes(networkRoot.leafNodes());
  }

  doubleClick(alluvialObject: Object, event: ?Event) {
    const noKeyModifiers: Event = {
      altKey: false,
      shiftKey: false,
    };

    const { shiftKey, altKey } = event || noKeyModifiers;

    if (alluvialObject.depth === Depth.MODULE) {
      const regroupOrExpand = (shiftKey
          ? this.regroupModule
          : this.expandModule
      ).bind(this);

      const networkIds = altKey ? this.alluvialRoot.networkIds : [alluvialObject.networkId];
      networkIds.forEach(networkId => regroupOrExpand(alluvialObject.moduleId, networkId));
    }
  }

  setModuleName(id: string, name: ?string) {
    const module = this.alluvialRoot.getModuleById(id);
    if (!module) return;
    module.name = name;
    this.dirty = true;
  }

  updateLayout(...args) {
    this.dirty = true;

    this.alluvialRoot.updateLayout(...args);
  }

  asObject(): Object {
    if (this.dirty) {
      this._asObject = this.alluvialRoot.asObject();
      this.dirty = false;
    }
    return this._asObject;
  }

  addNodes(nodes: Iterable<LeafNode>, moduleLevel: number = 1) {
    for (let node of nodes) {
      this.addNode(node, moduleLevel);
    }
  }

  addNode(node: LeafNode, moduleLevel: number = 1) {
    node.moduleLevel = moduleLevel;

    const networkRoot: ?NetworkRoot = this.alluvialRoot.getNetworkRoot(node.networkId);
    if (!networkRoot) {
      console.warn(`No network id ${node.networkId}`);
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

      const oppositeNode = this.alluvialRoot.getOppositeNode(node, branch.side);

      const streamlineId = StreamlineId.create(node, branch.side, oppositeNode);
      let streamlineNode = this.streamlineNodesById.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(node.networkId, branch, streamlineId);
        branch.addChild(streamlineNode);
        this.streamlineNodesById.set(streamlineId, streamlineNode);
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
    const oppositeNode: ?LeafNode = this.alluvialRoot.getOppositeNode(node, side);

    const streamlineId = StreamlineId.create(node, side, oppositeNode);
    let streamlineNode: ?StreamlineNode = this.streamlineNodesById.get(streamlineId);

    const oldStreamlineNode: ?StreamlineNode = node.getParent(side);
    if (!oldStreamlineNode) {
      console.warn(`Node ${node.id} has no ${sideToString(side)} parent`);
      return;
    }
    const branch: ?Branch = oldStreamlineNode.parent;

    if (!streamlineNode) {
      if (!branch) {
        console.warn(`Streamline node with id ${oldStreamlineNode.id} has no parent`);
        return;
      }

      streamlineNode = new StreamlineNode(node.networkId, branch, streamlineId);
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
      console.warn(`Node ${node.id} has no ${sideToString(side)} parent`);
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

        this.streamlineNodesById.set(oppositeStreamlineNode.id, oppositeStreamlineNode);
      }

      this.streamlineNodesById.delete(streamlineNode.id);

      streamlineNode.removeLink();
      streamlineNode.removeFromParent();
    }

    return branch.parent;
  }

  expandModule(moduleId: string, networkId: string) {
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
    this.addNodes(leafNodes, newModuleLevel);
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

    const modules = module.getSiblings();

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
    this.addNodes(leafNodes, newModuleLevel);
  }
}
