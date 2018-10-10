import AlluvialNodeBase from "./AlluvialNodeBase";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";


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
        return 0;
    }

    * traverseDepthFirst(): Iterable<AlluvialNodeBase> {
        yield this;
        for (let networkRoot of this.children) {
            yield networkRoot;
            for (let module of networkRoot.children) {
                yield module;
                for (let group of module.children) {
                    yield group;
                    for (let branch of group.children) {
                        yield branch;
                        for (let streamlineNode of branch.children) {
                            yield streamlineNode;
                        }
                    }
                }
            }
        }
    }
}
