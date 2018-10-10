import AlluvialNodeBase from "./AlluvialNodeBase";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";
import { ALLUVIAL_ROOT } from "./depth-constants";


export default class AlluvialRoot extends AlluvialNodeBase {
    children: NetworkRoot[] = [];

    getNetworkRoot(node: LeafNode, networkIndex): ?NetworkRoot {
        return this.children.find(root => root.networkIndex === networkIndex);
    }

    getOrCreateNetworkRoot(node: LeafNode, networkIndex): NetworkRoot {
        let root = this.getNetworkRoot(node, networkIndex);
        if (!root) {
            root = new NetworkRoot(networkIndex, this);
            this.children.push(root);
        }
        return root;
    }

    get depth(): number {
        return ALLUVIAL_ROOT;
    }

    * traverseDepthFirstUntil(predicate: (AlluvialNodeBase) => boolean): Iterable<AlluvialNodeBase> {
        yield this;
        for (let networkRoot of this.children) {
            if (predicate(networkRoot)) break;
            yield networkRoot;
            for (let module of networkRoot.children) {
                if (predicate(module)) break;
                yield module;
                for (let group of module.children) {
                    if (predicate(group)) break;
                    yield group;
                    for (let branch of group.children) {
                        if (predicate(branch)) break;
                        yield branch;
                        for (let streamlineNode of branch.children) {
                            if (predicate(streamlineNode)) break;
                            yield streamlineNode;
                        }
                    }
                }
            }
        }
    }
}
