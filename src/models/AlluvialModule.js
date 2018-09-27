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

    setRight(module: AlluvialModule): void {
        this.setSide("right", module);
    }

    setLeft(module: AlluvialModule): void {
        this.setSide("left", module);
    }

    setSide(side: Side, module: AlluvialModule): void {
        this[side] = module;

        const connect = this.connectNodes(side);

        if (this.level !== module.level) {
            module.subModulesAtLevel(this.level)
                .forEach(subModule => connect(subModule));
        } else {
            connect(module);
        }

        this.modules.forEach(subModule => subModule.setSide(side, module));
    }

    connectNodes(side: Side): (AlluvialModule) => void {
        const otherSide: Side = side === "left" ? "right" : "left";

        return (module: AlluvialModule): void =>
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

