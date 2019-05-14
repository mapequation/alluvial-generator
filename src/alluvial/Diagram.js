// @flow
import type { VerticalAlign } from "./AlluvialRoot";
import AlluvialRoot from "./AlluvialRoot";
import type { Side } from "./Side";
import { opposite, sideToString } from "./Side";
import Depth from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";
import HighlightGroup from "./HighlightGroup";


type Event = {
  altKey: boolean,
  shiftKey: boolean
};


export default class Diagram {
  alluvialRoot = new AlluvialRoot();

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

    const networkRoot = new NetworkRoot(this.alluvialRoot, id, name, codelength);

    const leafNodes = nodes.map(node => new LeafNode(node, id));
    networkRoot.createLeafNodeByNameMap(leafNodes);

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

  doubleClick(alluvialObject: Object, event: ?Event): boolean {
    const noKeyModifiers: Event = {
      altKey: false,
      shiftKey: false,
    };

    const { shiftKey } = event || noKeyModifiers;

    if (alluvialObject.depth === Depth.MODULE) {
      if (shiftKey) {
        return this.regroupModule(alluvialObject.moduleId, alluvialObject.networkId);
      } else {
        return this.expandModule(alluvialObject.moduleId, alluvialObject.networkId);
      }
    } else if (alluvialObject.depth === Depth.STREAMLINE_NODE) {
      let leftSuccess, rightSuccess;
      if (shiftKey) {
        leftSuccess = this.regroupModule(alluvialObject.leftModuleId, alluvialObject.leftNetworkId);
        rightSuccess = this.regroupModule(alluvialObject.rightModuleId, alluvialObject.rightNetworkId);
      } else {
        leftSuccess = this.expandModule(alluvialObject.leftModuleId, alluvialObject.leftNetworkId);
        rightSuccess = this.expandModule(alluvialObject.rightModuleId, alluvialObject.rightNetworkId);
      }
      return leftSuccess || rightSuccess;
    }

    return false;
  }

  setModuleName(id: string, name: ?string) {
    const module = this.alluvialRoot.getModuleById(id);
    if (!module) return;
    module.name = name;
    this.dirty = true;
  }

  updateLayout(
    totalWidth: number,
    height: number,
    streamlineFraction: number,
    maxModuleWidth: number,
    flowThreshold: number,
    verticalAlign: VerticalAlign = "bottom",
  ) {
    this.dirty = true;

    this.alluvialRoot.updateLayout(totalWidth, height, streamlineFraction, maxModuleWidth, flowThreshold, verticalAlign);
  }

  asObject(): Object {
    if (this.dirty) {
      this._asObject = this.alluvialRoot.asObject();
      this.dirty = false;
    }
    return this._asObject;
  }

  addNodes(nodes: Iterable<LeafNode>, moduleLevel: ?number) {
    for (let node of nodes) {
      this.addNode(node, moduleLevel || node.moduleLevel);
    }
  }

  addNode(node: LeafNode, moduleLevel: number) {
    node.moduleLevel = moduleLevel;

    const networkRoot = this.alluvialRoot.getNetworkRoot(node.networkId);
    if (!networkRoot) {
      console.warn(`No network id ${node.networkId}`);
      return;
    }

    this.alluvialRoot.flow += node.flow;
    networkRoot.flow += node.flow;

    const module = networkRoot.getModule(node.moduleId) || new Module(networkRoot, node.moduleId, node.moduleLevel);
    const group = module.getGroup(node.highlightIndex) || new HighlightGroup(module, node.highlightIndex);

    module.flow += node.flow;
    group.flow += node.flow;

    for (let branch of group) {
      branch.flow += node.flow;

      const oppositeNode = this.alluvialRoot.getOppositeNode(node, branch.side);

      const streamlineId = StreamlineId.create(node, branch.side, oppositeNode);
      let streamlineNode = StreamlineId.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(branch, streamlineId);
        StreamlineId.set(streamlineId, streamlineNode);
      }

      if (streamlineNode.hasTarget) {
        const oppositeStreamlineIsDangling = StreamlineId.has(streamlineNode.targetId);
        if (oppositeStreamlineIsDangling && oppositeNode /* oppositeNode always exists if we have a target id */) {
          const oppositeSide = opposite(branch.side);
          oppositeNode.removeFromSide(oppositeSide);
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
    let streamlineNode = StreamlineId.get(streamlineId);

    if (!streamlineNode) {
      const oldStreamlineNode = node.getParent(side);
      if (!oldStreamlineNode) {
        console.warn(`Node ${node.id} has no ${sideToString(side)} parent`);
        return;
      }
      const branch = oldStreamlineNode.parent;
      if (!branch) {
        console.warn(`Streamline node with id ${oldStreamlineNode.id} has no parent`);
        return;
      }

      streamlineNode = new StreamlineNode(branch, streamlineId);
      StreamlineId.set(streamlineId, streamlineNode);

      if (oppositeNode) {
        const oppositeId = StreamlineId.oppositeId(streamlineId);
        const oppositeStreamlineNode = StreamlineId.get(oppositeId);

        if (oppositeStreamlineNode) {
          streamlineNode.linkTo(oppositeStreamlineNode);
        }
      }
    }

    const branch = streamlineNode.parent;
    if (branch) branch.flow += node.flow;

    streamlineNode.addChild(node);
    streamlineNode.flow += node.flow;
    node.setParent(streamlineNode, side);
  }

  removeNodes(nodes: Iterable<LeafNode>) {
    for (let node of nodes) {
      node.remove();
    }
  }

  expandModule(moduleId: string, networkId: string) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return false;
    }

    const module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return false;
    }

    const leafNodes: LeafNode[] = Array.from(module.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const newModuleLevel = module.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(node => node.level <= newModuleLevel);
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
        `because some nodes are at level ${newModuleLevel - 1}`,
      );
      return false;
    }

    this.removeNodes(leafNodes);
    this.addNodes(leafNodes, newModuleLevel);

    return true;
  }

  regroupModule(moduleId: string, networkId: string) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return false;
    }

    const module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return false;
    }

    if (module.moduleLevel <= 1) {
      console.warn(`Module with id ${moduleId} is already at module level ${module.moduleLevel}`);
      return false;
    }

    const modules = module.getSiblings();

    const leafNodes = [].concat.apply(
      [],
      modules.map(module => [...module.leafNodes()]),
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const newModuleLevel = module.moduleLevel - 1;
    this.removeNodes(leafNodes);
    this.addNodes(leafNodes, newModuleLevel);

    return true;
  }
}
