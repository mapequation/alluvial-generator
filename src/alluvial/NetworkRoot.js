// @flow
import type { Node } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Module from "./Module";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class NetworkRoot extends AlluvialNodeBase {
    children: Module[] = [];

    getOrCreateModule(node: Node, moduleLevel: number): Module {
        const moduleId = TreePath.ancestorAtLevel(node.path, moduleLevel).toString();
        let module = this.children.find(module => module.id === moduleId);
        if (!module) {
            module = new Module(this.networkIndex, moduleId);
            this.children.push(module);
        }
        return module;
    }

    get depth(): number {
        return 1;
    }

    asObject(): Object {
        return {
            ...super.asObject(),
            links: Array.from(this.rightStreamlines()).map(link => link.asObject()),
        };
    }

    * rightStreamlineNodes(): Iterable<StreamlineNode> {
        for (let module of this.children) {
            for (let group of module.children) {
                for (let streamlineNode of group.right.children) {
                    yield streamlineNode;
                }
            }
        }
    }

    * rightStreamlines(): Iterable<StreamlineLink> {
        for (let streamlineNode of this.rightStreamlineNodes()) {
            if (streamlineNode.link) yield streamlineNode.link;
        }
    }
}
