// @flow
import type { Node } from "../io/parse-ftree";
import AlluvialModule from "./AlluvialModule";
import type { IAlluvialBase } from "./IAlluvialBase";
import Path from "./Path";


export default class AlluvialNode extends Path implements IAlluvialBase {
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

    get name() {
        return this.node.name;
    }
}
