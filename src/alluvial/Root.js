// @flow
import type { FTree } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import Module from "./Module";
import Node from "./Node";


export default class Root {
    left: ?Root = null;
    right: ?Root = null;

    nodes: Node[];
    nodesByName: Map<string, Node>;

    root: Module;
    modules: Module[];
    modulesByPath: Map<string, Module>;
    visibleModules: Module[];

    constructor(network: FTree) {
        const { nodes, modules } = network.data;

        this.nodes = nodes.map(node => new Node(node));
        this.nodesByName = new Map(this.nodes.map(node => [node.name, node]));

        const root = modules.find(module => TreePath.isRoot(module.path));

        if (!root) {
            throw new Error("No root module found!");
        }

        this.root = new Module(root);

        this.modules = modules
            .filter(module => !TreePath.isRoot(module.path))
            .map(module => new Module(module));

        this.modulesByPath = new Map(this.modules.map(module => [module.path.toString(), module]));

        const maxNumModules = 15;
        const accumulationTarget = 0.99 * this.root.flow;

        const accumulateFlow = (target: number) => {
            let accumulated = 0;
            return node => (accumulated += node.flow) <= target;
        };

        this.visibleModules = this.modules
            .filter(module => module.level === 1)
            .sort((a, b) => b.flow - a.flow)
            .slice(0, maxNumModules)
            .filter(accumulateFlow(accumulationTarget));
    }

    setRight(right: Root): void {
        this.right = right;
        right.left = this;

        this.nodes.forEach(leftNode => {
            const rightNode = right.nodesByName.get(leftNode.name);
            if (rightNode) {
                leftNode.right = rightNode;
                rightNode.left = leftNode;
            }
        });

        const pairs: [Node, Node][] = this.nodes
            .filter(node => node.right)
            .map(node => [node, node.right]);

        pairs.map(([leftNode, rightNode]) => {
                const leftParent = this.visibleModules.find(module => module.path.isAncestor(leftNode.path));
                const rightParent = right.visibleModules.find(module => module.path.isAncestor(rightNode.path));
                return { leftNode, rightNode, leftParent, rightParent };
            })
            .filter(({ leftParent, rightParent }) => leftParent && rightParent)
            .forEach(({ leftNode, rightNode, leftParent, rightParent }) => {

            });
    }
}
