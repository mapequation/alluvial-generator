// @flow
import AlluvialRoot from "./AlluvialRoot";
import Depth from "./Depth";
import { NOT_HIGHLIGHTED } from "./HighlightGroup";


type Event = {
  shiftKey: boolean
};

export default class Diagram {
  alluvialRoot = new AlluvialRoot();

  dirty: boolean = true;
  _asObject: Object = {};

  constructor(networks: Network[]) {
    networks.forEach(network => this.alluvialRoot.addNetwork(network));
  }

  doubleClick(alluvialObject: Object, event: ?Event): boolean {
    const noKeyModifiers: Event = {
      shiftKey: false
    };

    const { shiftKey } = event || noKeyModifiers;
    const action = shiftKey ? this.alluvialRoot.regroupModule : this.alluvialRoot.expandModule;

    const { depth } = alluvialObject;

    if (depth === Depth.MODULE) {
      const { moduleId, networkId } = alluvialObject;
      return action.call(this.alluvialRoot, moduleId, networkId);
    }

    if (depth === Depth.STREAMLINE_NODE) {
      const { rightNetworkId, leftNetworkId, rightModuleId, leftModuleId } = alluvialObject;
      const leftSuccess = action.call(this.alluvialRoot, leftModuleId, leftNetworkId);
      const rightSuccess = action.call(this.alluvialRoot, rightModuleId, rightNetworkId);
      return leftSuccess || rightSuccess;
    }

    return false;
  }

  setModuleName(alluvialObject: Object) {
    const { name, networkId, moduleId } = alluvialObject;
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    const module = networkRoot.getModule(moduleId);
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
    const { highlightIndex, networkId, moduleId } = alluvialObject;
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    const module = networkRoot.getModule(moduleId);
    if (!module) return;
    const leafNodes = Array.from(module.leafNodes());

    leafNodes.forEach(node => {
      node.highlightIndex = highlightIndex;
      node.update();
    });

    if (allNetworks) {
      this.alluvialRoot.children
        .filter(root => root.networkId !== networkId)
        .forEach(networkRoot =>
          leafNodes
            .reduce((nodes, node) => {
              const oppositeNode = networkRoot.getLeafNode(node.identifier);
              if (oppositeNode) {
                oppositeNode.highlightIndex = highlightIndex;
                nodes.push(oppositeNode);
              }
              return nodes;
            }, [])
            .forEach(node => node.update()));
    }

    this.dirty = true;
  }

  autoPaint(
    alluvialObject: ?Object = null,
    highlightIndices: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  ) {
    const networkId = alluvialObject ? alluvialObject.networkId : this.alluvialRoot.children[0].networkId;

    if (!networkId) {
      console.warn("Tried to auto paint but could not find a network id!");
      return;
    }

    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);

    if (!networkRoot) {
      console.warn(`No network root found with id ${networkId}`);
      return;
    }

    if (highlightIndices.length === 0) {
      console.warn("Zero length array of highlight indices");
      return;
    }

    networkRoot.children
      .filter(module => module.flow > 0)
      .forEach((module, i) =>
        this.setModuleColor({
          ...module.asObject(),
          highlightIndex: highlightIndices[i % highlightIndices.length]
        }, true));
  }

  removeColors() {
    for (let networkRoot of this.alluvialRoot) {
      const modules = [];
      for (let module of networkRoot) {
        for (let highlightGroup of module) {
          if (highlightGroup.isHighlighted) {
            modules.push(module);
            break;
          }
        }
      }
      modules.forEach(module => this.setModuleColor({
        ...module.asObject(),
        highlightIndex: NOT_HIGHLIGHTED
      }));
    }

    this.dirty = true;
  }

  getVisibleModules(): { [key: string]: Array<string> } {
    const networkRoots = this.alluvialRoot.children;

    const visibleModules = {};

    networkRoots.forEach(({ networkId, children }) =>
      visibleModules[networkId] = children.map(module => module.moduleId));

    return visibleModules;
  }

  clearFilters() {
    this.alluvialRoot.children.forEach(networkRoot => networkRoot.clearFilter());
  }

  setVisibleModules(visibleModules: { [key: string]: Array<string> }) {
    for (let [networkId, moduleIds] of Object.entries(visibleModules)) { // $FlowFixMe
      const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);

      if (!networkRoot) {
        console.warn(`Invalid network id ${networkId}`);
        return;
      }

      // $FlowFixMe
      networkRoot.setVisibleModules(moduleIds);
    }
  }

  updateLayout() {
    this.dirty = true;
    this.alluvialRoot.calcFlow();
    this.alluvialRoot.updateLayout(...arguments);
  }

  asObject(): Object {
    if (this.dirty) {
      this._asObject = this.alluvialRoot.asObject();
      this.dirty = false;
    }
    return this._asObject;
  }

}
