// @flow
import type { Node } from "../io/parse-ftree";
import AlluvialModule from "./AlluvialModule";
import Path from "./Path";


export default class AlluvialNode extends Path {
    node: Node;
    left: ?AlluvialNode = null;
    right: ?AlluvialNode = null;
    parent: AlluvialModule;

    constructor(node: Node, parent: AlluvialModule) {
        super(node.path);
        this.node = node;
        this.parent = parent;
    }

    get flow() {
        return this.node.flow;
    }
}
