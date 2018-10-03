// @flow
import TreePath from "../lib/treepath";
import type { Node, Module } from "../io/parse-ftree";


export default class NodeBase {
    +node: Node | Module;
    +path: TreePath;
    +rank: number;
    +level: number;

    constructor(node: Node | Module) {
        this.node = node;
        this.path = new TreePath(node.path);
        this.rank = this.path.rank;
        this.level = this.path.level;
    }

    get name() {
        return this.node.name;
    }

    get flow() {
        return this.node.flow;
    }
}
