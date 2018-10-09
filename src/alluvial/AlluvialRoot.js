import type { Node } from "../io/parse-ftree";
import AlluvialNodeBase from "./AlluvialNodeBase";
import NetworkRoot from "./NetworkRoot";


export default class AlluvialRoot extends AlluvialNodeBase {
    networkRoots: NetworkRoot[] = [];

    getOrCreateNetworkRoot(node: Node, networkIndex): NetworkRoot {
        let root = this.networkRoots.find(root => root.networkIndex === networkIndex);
        if (!root) {
            root = new NetworkRoot(networkIndex);
            this.networkRoots.push(root);
        }
        return root;
    }

    get depth(): number {
        return 0;
    }

    asObject(): Object {
        return {
            depth: this.depth,
            layout: this.layout,
            children: this.networkRoots.map(r => r.asObject()),
        };
    }

}
