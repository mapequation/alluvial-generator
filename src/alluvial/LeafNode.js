import type { Node as FTreeNode } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialNodeBase from "./AlluvialNodeBase";
import { LEFT } from "./Branch";
import type { Side } from "./Branch";
import { LEAF_NODE } from "./depth-constants";
import StreamlineNode from "./StreamlineNode";


export default class LeafNode extends AlluvialNodeBase {
    node: FTreeNode;
    moduleLevel: number = 1;
    leftParent: ?StreamlineNode;
    rightParent: ?StreamlineNode;

    constructor(node: FTreeNode, networkIndex: number) {
        super(networkIndex, null, node.path);
        this.node = node;
        this.name = node.name;
        this.flow = node.flow;
        this.insignificant = node.insignificant;
        this.highlightIndex = node.highlightIndex;
    }

    ancestorAtLevel(moduleLevel: number): string {
        return TreePath.ancestorAtLevel(this.node.path, moduleLevel).toString();
    }

    getParent(side: Side): ?StreamlineNode {
        return side === LEFT ? this.leftParent : this.rightParent;
    }

    setParent(parent: StreamlineNode, side: Side) {
        if (side === LEFT) {
            this.leftParent = parent;
        } else {
            this.rightParent = parent;
        }
    }

    get depth(): number {
        return LEAF_NODE;
    }
}
