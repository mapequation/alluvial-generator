// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { ALLUVIAL_ROOT } from "./depth-constants";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";

export default class AlluvialRoot extends AlluvialNodeBase {
  children: NetworkRoot[] = [];
  maxModuleLevel: number = 1;

  constructor() {
    super("", null, "root");
  }

  getNetworkRoot(networkId: string): ?NetworkRoot {
    return this.children.find(root => root.networkId === networkId);
  }

  getOrCreateNetworkRoot(node: LeafNode, networkId: string): NetworkRoot {
    let root = this.getNetworkRoot(networkId);
    if (!root) {
      root = new NetworkRoot(networkId, this);
      this.children.push(root);
    }
    return root;
  }

  get depth(): number {
    return ALLUVIAL_ROOT;
  }

  asObject(): Object {
    return {
      maxModuleLevel: this.maxModuleLevel,
      ...super.asObject()
    };
  }
}
