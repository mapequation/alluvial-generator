// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { ALLUVIAL_ROOT } from "./depth-constants";
import NetworkRoot from "./NetworkRoot";

export default class AlluvialRoot extends AlluvialNodeBase {
  children: NetworkRoot[] = [];

  constructor() {
    super("", null, "root");
  }

  getNetworkRoot(networkId: string): ?NetworkRoot {
    return this.children.find(root => root.networkId === networkId);
  }

  createNetworkRoot(networkId: string, name: string): NetworkRoot {
    let root = new NetworkRoot(networkId, this, name);
    this.children.push(root);
    return root;
  }

  get depth(): number {
    return ALLUVIAL_ROOT;
  }
}
