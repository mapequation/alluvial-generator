import type { FTree } from "../io/parse-ftree";
import TreePath from "../lib/treepath";
import AlluvialModule from "./AlluvialModule";
import AlluvialNode from "./AlluvialNode";
import TreeNode from "./TreeNode";


export default class AlluvialRoot {
    +network: FTree;

    left: ?AlluvialRoot = null;
    right: ?AlluvialRoot = null;

    nodes: AlluvialNode[];
    nodeIndexByName: Map<string, number>;

    root: AlluvialModule;
    modules: AlluvialModule[];
    moduleIndexByPath: Map<string, number>;
    visibleModules: AlluvialModule[];

    maxNumModules: number;
    flowThreshold: number = 1e-7;
    accumulationTarget: number;

    constructor(network: FTree, maxNumModules: number) {
        this.network = network;
        this.maxNumModules = maxNumModules;
        const { nodes, modules } = network.data;

        this.nodes = nodes.map(node => new AlluvialNode(node));
        this.nodeIndexByName = new Map(this.nodes.map(({ name }, i) => [name, i]));

        const root = modules.find(module => TreePath.isRoot(module.path));

        if (root) {
            this.root = new AlluvialModule(root);
        } else {
            throw new Error("No root module found!");
        }

        this.modules = modules
            .filter(module => !TreePath.isRoot(module.path))
            .map(module => new AlluvialModule(module));
        this.moduleIndexByPath = new Map(this.modules.map(({ path }, i) => [path.toString(), i]));

        this.accumulationTarget = 0.99 * this.root.flow;

        this.visibleModules = this.modules
            .filter(module => module.flow > this.flowThreshold)
            .filter(module => module.level === 1)
            .sort((a, b) => b.flow - a.flow)
            .slice(0, maxNumModules)
            .filter(AlluvialRoot.accumulateFlow(this.accumulationTarget));
    }

    setRight(right: AlluvialRoot): void {
        this.right = right;
        right.left = this;

        this.connectNodes(right);

        const nodePairs = this.nodes
            .filter(node => node.right)
            .map(node => [node, node.right]);

        nodePairs.forEach(([leftNode, rightNode]) => {
            const leftModule = this.findVisibleParentModule(leftNode.path);
            const rightModule = right.findVisibleParentModule(rightNode.path);

            if (leftModule && rightModule) {
                leftModule.right.getStreamlineToRight(rightModule.left)
                    .addNodePair(leftNode, rightNode);
            }
        });
    }

    connectNodes(right: AlluvialRoot): void {
        this.nodes.forEach(leftNode => {
            const rightNode = right.getNode(leftNode.name);
            if (rightNode) {
                leftNode.right = rightNode;
                rightNode.left = leftNode;
            }
        });
    }

    getNode(name: string): ?AlluvialNode {
        const index = this.nodeIndexByName.get(name);
        return index ? this.nodes[index] : null;
    }

    getModule(path: string): ?AlluvialModule {
        const index = this.moduleIndexByPath.get(path);
        return index ? this.modules[index] : null;
    }

    findVisibleParentModule(childPath: string): ?AlluvialModule {
        return this.visibleModules.find(m => m.path.isAncestor(childPath));
    }

    static accumulateFlow(target: number) {
        let accumulated = 0;
        return (node: TreeNode) => (accumulated += node.flow) <= target;
    }
}
