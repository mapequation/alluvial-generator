// @flow
import type { Node } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Module from "./Module";


export default class Root extends AlluvialNodeBase {
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
}
