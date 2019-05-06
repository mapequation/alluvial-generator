// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { ALLUVIAL_ROOT } from "./Depth";
import NetworkRoot from "./NetworkRoot";

export default class AlluvialRoot extends AlluvialNodeBase {
  children: NetworkRoot[] = [];
  depth = ALLUVIAL_ROOT;

  constructor() {
    super("", null, "root");
  }

  getNetworkRoot(networkId: string): ?NetworkRoot {
    return this.children.find(root => root.networkId === networkId);
  }

  createNetworkRoot(networkId: string, name: string, codelength: number): NetworkRoot {
    let root = new NetworkRoot(networkId, this, name, codelength);
    this.children.push(root);
    return root;
  }
}
