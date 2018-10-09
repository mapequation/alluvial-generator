// @flow
import type { Node } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Module from "./Module";


export default class NetworkRoot extends AlluvialNodeBase {
    modules: Module[] = [];

    getOrCreateModule(node: Node, moduleLevel: number): Module {
        const moduleId = TreePath.ancestorAtLevel(node.path, moduleLevel).toString();
        let module = this.modules.find(module => module.id === moduleId);
        if (!module) {
            module = new Module(this.networkIndex, moduleId);
            this.modules.push(module);
        }
        return module;
    }

    get depth(): number {
        return 1;
    }

    asObject(): Object {
        return {
            depth: this.depth,
            layout: this.layout,
            children: this.modules.map(m => m.asObject()),
        };
    }
}
