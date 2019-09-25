// @flow
import AlluvialRoot from "./AlluvialRoot";
import Depth from "./Depth";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import type { Side } from "./Side";
import { opposite, sideToString } from "./Side";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";


type Event = {
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
    const { nodes, id, codelength, name, moduleNames } = network;

    if (this.alluvialRoot.hasNetwork(id)) {
      throw new Error(`Network with id ${id} already exists`);
    }

    const networkRoot = new NetworkRoot(this.alluvialRoot, id, name, codelength);

    if (moduleNames) {
      Module.customNames = new Map([...Module.customNames, ...moduleNames]);
    }

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
      shiftKey: false
    };

    const { shiftKey } = event || noKeyModifiers;
    const action = shiftKey ? this.regroupModule : this.expandModule;

    const { depth } = alluvialObject;

    if (depth === Depth.MODULE) {
      const { moduleId, networkId } = alluvialObject;
      return action.call(this, moduleId, networkId);
    }

    if (depth === Depth.STREAMLINE_NODE) {
      const { rightNetworkId, leftNetworkId, rightModuleId, leftModuleId } = alluvialObject;
      const leftSuccess = action.call(this, leftModuleId, leftNetworkId);
      const rightSuccess = action.call(this, rightModuleId, rightNetworkId);
      return leftSuccess || rightSuccess;
    }

    return false;
  }

  getModule(alluvialObject: Object) {
    const { networkId, moduleId } = alluvialObject;
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    return networkRoot.getModule(moduleId);
  }

  setModuleName(alluvialObject: Object) {
    const { name } = alluvialObject;
    const module = this.getModule(alluvialObject);
    if (!module) return;
    module.name = name;
    this.dirty = true;
  }

  setNetworkName(alluvialObject: Object) {
    const { networkId, networkName } = alluvialObject;
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    networkRoot.name = networkName;
    this.dirty = true;
  }

  setModuleColor(alluvialObject: Object, allNetworks: boolean = false) {
    const { highlightIndex, networkId } = alluvialObject;
    const module = this.getModule(alluvialObject);
    if (!module) return;
    const leafNodes = Array.from(module.leafNodes());
    leafNodes.forEach(node => node.highlightIndex = highlightIndex);
    this.removeNodes(leafNodes);
    this.addNodes(leafNodes);

    if (allNetworks) {
      this.alluvialRoot.children
        .filter(root => root.networkId !== networkId)
        .forEach(networkRoot => {
          const nodes = leafNodes.reduce((nodes, node) => {
            const oppositeNode = networkRoot.getLeafNode(node.identifier);
            if (oppositeNode) {
              oppositeNode.highlightIndex = highlightIndex;
              nodes.push(oppositeNode);
            }
            return nodes;
          }, []);

          this.removeNodes(nodes);
          this.addNodes(nodes);
        });
    }

    this.dirty = true;
  }

  updateLayout() {
    this.dirty = true;
    this.alluvialRoot.updateLayout(...arguments);
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
        const oppositeSide = opposite(branch.side);
        oppositeNode.removeFromSide(oppositeSide);
        this.addNodeToSide(oppositeNode, oppositeSide);
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
        `because some nodes are at level ${newModuleLevel - 1}`
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
      modules.map(module => [...module.leafNodes()])
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
