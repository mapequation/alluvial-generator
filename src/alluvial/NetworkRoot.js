// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { NETWORK_ROOT } from "./depth-constants";
import LeafNode from "./LeafNode";
import Module from "./Module";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class NetworkRoot extends AlluvialNodeBase {
    children: Module[] = [];

    getModule(moduleId: string): ?Module {
        return this.children.find(module => module.id === moduleId);
    }

    getOrCreateModule(node: LeafNode, moduleLevel: number): Module {
        const moduleId = node.ancestorAtLevel(moduleLevel);
        let module = this.getModule(moduleId);
        if (!module) {
            module = new Module(this.networkIndex, this, moduleId);
            this.children.push(module);
        }
        return module;
    }

    get depth(): number {
        return NETWORK_ROOT;
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
                yield* group.right.children;
            }
        }
    }

    * rightStreamlines(): Iterable<StreamlineLink> {
        for (let streamlineNode of this.rightStreamlineNodes()) {
            if (streamlineNode.link) yield streamlineNode.link;
        }
    }

    sortChildren() {
        this.children.sort((a, b) => b.flow - a.flow);
    }
}
