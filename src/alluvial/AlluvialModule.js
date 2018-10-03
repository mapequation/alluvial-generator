// @flow
import AlluvialBranch from "./AlluvialBranch";
import TreeNode from "./TreeNode";


export default class AlluvialModule extends TreeNode {
    left = new AlluvialBranch();
    right = new AlluvialBranch();
}
