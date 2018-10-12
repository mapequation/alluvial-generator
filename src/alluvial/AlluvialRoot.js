import AlluvialNodeBase from "./AlluvialNodeBase";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";
import { ALLUVIAL_ROOT } from "./depth-constants";


export default class AlluvialRoot extends AlluvialNodeBase {
    children: NetworkRoot[] = [];

    constructor() {
        super(undefined, null, "root");
    }

    getNetworkRoot(networkIndex): ?NetworkRoot {
        return this.children.find(root => root.networkIndex === networkIndex);
    }

    getOrCreateNetworkRoot(node: LeafNode, networkIndex): NetworkRoot {
        let root = this.getNetworkRoot(networkIndex);
        if (!root) {
            root = new NetworkRoot(networkIndex, this);
            this.children.push(root);
        }
        return root;
    }

    get depth(): number {
        return ALLUVIAL_ROOT;
    }
}
