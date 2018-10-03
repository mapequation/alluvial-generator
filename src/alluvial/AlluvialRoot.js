// @flow
import type { FTree, Node, Module } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialModule from "./AlluvialModule";
import AlluvialNode from "./AlluvialNode";
import TreeNode from "./TreeNode";


export default class AlluvialRoot {
    +network: FTree;

    left: ?AlluvialRoot = null;
    right: ?AlluvialRoot = null;

    nodes: AlluvialNode[];
    nodesByName: Map<string, AlluvialNode>;

    root: AlluvialModule;
    modules: AlluvialModule[];
    modulesByPath: Map<string, AlluvialModule>;
    visibleModules: AlluvialModule[];

    constructor(network: FTree) {
        this.network = network;
        this.setNodes(network.data.nodes);
        this.setModules(network.data.modules);
        this.setVisibleModules();
    }

    setNodes(nodes: Node[]) {
        this.nodes = nodes.map(node => new AlluvialNode(node));
        this.nodesByName = new Map(this.nodes.map(node => [node.name, node]));
    }

    setModules(modules: Module[]) {
        const root = modules.find(module => TreePath.isRoot(module.path));

        if (!root) {
            throw new Error("No root module found!");
        }

        this.root = new AlluvialModule(root);

        this.modules = modules
            .filter(module => !TreePath.isRoot(module.path))
            .map(module => new AlluvialModule(module));

        this.modulesByPath = new Map(this.modules.map(module => [module.path.toString(), module]));
    }

    setVisibleModules() {
        const flowThreshold = 1e-7;
        const maxNumModules = 15;
        const accumulationTarget = 0.99 * this.root.flow;

        this.visibleModules = this.modules
            .filter(module => module.flow > flowThreshold)
            .filter(module => module.level === 1)
            .sort((a, b) => b.flow - a.flow)
            .slice(0, maxNumModules)
            .filter(AlluvialRoot.accumulateFlow(accumulationTarget));
    }

    setRight(right: AlluvialRoot): void {
        this.right = right;
        right.left = this;

        this.nodes.forEach(leftNode => {
            const rightNode = right.nodesByName.get(leftNode.name);
            if (rightNode) {
                leftNode.right = rightNode;
                rightNode.left = leftNode;
            }
        });
    }

    static accumulateFlow(target: number) {
        let accumulated = 0;
        return (node: TreeNode) => (accumulated += node.flow) <= target;
    }
}
