// @flow
import type { Module, Node } from "../io/parse-ftree";
import id from "../lib/id";
import TreePath from "../lib/treepath";
import AlluvialNode from "./AlluvialNode";
import type { IAlluvialBase } from "./IAlluvialBase";
import Path from "./Path";


type Side = "left" | "right";

export default class AlluvialModule extends Path implements IAlluvialBase {
    id: string = id();
    module: Module;
    modules: AlluvialModule[];
    nodes: AlluvialNode[];
    left: ?AlluvialModule = null;
    right: ?AlluvialModule = null;
    parent: ?AlluvialModule = null;

    constructor(module: Module,
                subModules: Module[],
                nodes: Node[],
                parent: ?AlluvialModule = null) {
        super(module.path);
        this.module = module;
        this.parent = parent;

        this.modules = subModules
            .filter(module => this.path.isParentOf(module.path))
            .map(subModule =>
                new AlluvialModule(
                    subModule,
                    subModules.filter(m => TreePath.isAncestor(subModule.path, m.path)),
                    nodes.filter(n => TreePath.isAncestor(subModule.path, n.path)),
                    this));

        let accumulatedFlow = 0;
        const accumulationTarget = 0.95 * this.flow;

        this.nodes = nodes
            .sort((a, b) => b.flow - a.flow)
            .filter(node => (accumulatedFlow += node.flow) <= accumulationTarget)
            .map(node => new AlluvialNode(node, this))
            .sort((a, b) => a.rank - b.rank);

        this.nodesByName = new Map(this.nodes.map(node => [node.name, node]));
    }

    setRight(right: AlluvialModule): void {
        this.right = right;

        const connectRight = this.connectNodes("right");

        if (this.level !== right.level) {
            right.subModulesAtLevel(this.level)
                .forEach(subModule => connectRight(subModule));
        } else {
            connectRight(right);
        }

        this.modules.forEach(m => m.setRight(right));
    }

    setLeft(left: AlluvialModule): void {
        this.left = left;

        const connectLeft = this.connectNodes("left");

        if (this.level !== left.level) {
            left.subModulesAtLevel(this.level)
                .forEach(subModule => connectLeft(subModule));
        } else {
            connectLeft(left);
        }

        this.modules.forEach(m => m.setLeft(left));
    }

    connectNodes(side: Side) {
        const otherSide: Side = side === "left" ? "right" : "left";
        return (module: AlluvialModule) =>
            this.nodes.forEach(node => {
                const other = module.getNode(node.name);
                if (other) {
                    node[side] = other;
                    other[otherSide] = node;
                }
            });
    }

    get flow() {
        return this.module.flow;
    }

    get name() {
        return this.module.name;
    }

    find(predicate: Predicate<AlluvialNode>): ?AlluvialNode {
        return this.nodes.find(predicate);
    }

    getNode(name: string): ?AlluvialNode {
        return this.nodesByName.get(name);
    }

    subModulesAtLevel(level: number): AlluvialModule[] {
        const modules: AlluvialModule[] = [];

        this.modules.forEach(module => {
            if (this.level === module.level) modules.push(module);
            else modules.push(...module.subModulesAtLevel(level));
        });

        return modules;
    }
}

