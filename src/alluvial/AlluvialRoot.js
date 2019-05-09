// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Branch";
import { ALLUVIAL_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
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
    const root = new NetworkRoot(networkId, this, name, codelength);
    this.children.push(root);
    return root;
  }

  hasNetwork(networkId: string): boolean {
    return this.children.some(network => network.networkId === networkId);
  }

  getNeighborNetwork(networkId: string, side: Side): ?NetworkRoot {
    const networkIndex = this.children.findIndex(networkRoot => networkRoot.networkId === networkId);
    if (networkIndex === -1) return;
    const neighborNetworkIndex = networkIndex + side;
    if (
      neighborNetworkIndex < 0 ||
      neighborNetworkIndex === this.children.length
    )
      return;
    return this.children[neighborNetworkIndex];
  }

  get networkIds(): string[] {
    return this.children.map(networkRoot => networkRoot.networkId);
  }

  getOppositeNode(node: LeafNode, side: Side): ?LeafNode {
    const networkRoot = this.getNeighborNetwork(node.networkId, side);
    if (!networkRoot) return;

    return networkRoot.getLeafNodeByName(node.name);
  }
}
