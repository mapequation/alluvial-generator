import TreePath from "../lib/treepath";


export default class TreeNode {
    +path: TreePath;

    constructor(node) {
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
