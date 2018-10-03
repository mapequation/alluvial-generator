import AlluvialBranch from "./AlluvialBranch";
import AlluvialNode from "./AlluvialNode";


export default class AlluvialStreamline {
    left: AlluvialBranch;
    right: AlluvialBranch;
    nodes: Branch<AlluvialNode>[] = [];

    constructor(left: AlluvialBranch, right: AlluvialBranch) {
        this.left = left;
        this.right = right;
        left.streamlines.push(this);
        right.streamlines.push(this);
    }

    addNodePair(left: AlluvialNode, right: AlluvialNode): void {
        this.nodes.push({ left, right });
    }

    get leftFlow(): number {
        return this.nodes.reduce((tot, { left }) => tot + left.flow, 0);
    }

    get rightFlow(): number {
        return this.nodes.reduce((tot, { right }) => tot + right.flow, 0);
    }
}
