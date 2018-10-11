// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { NETWORK_ROOT } from "./depth-constants";
import LeafNode from "./LeafNode";
import Module from "./Module";
import StreamlineNode from "./StreamlineNode";
import StreamlineLink from "./StreamlineLink";


export default class NetworkRoot extends AlluvialNodeBase {
    children: Module[] = [];
    flowThreshold: number = 1e-5;

    getModule(moduleId: string): ?Module {
        return this.children.find(module => module.id === moduleId);
    }

    getOrCreateModule(node: LeafNode, moduleLevel: number): Module {
        const moduleId = node.ancestorAtLevel(moduleLevel);
        let module = this.getModule(moduleId);
        if (!module) {
            module = new Module(this.networkIndex, this, moduleId, moduleLevel);
            this.children.push(module);
        }
        return module;
    }

    get depth(): number {
        return NETWORK_ROOT;
    }

    asObject(): Object {
        return {
            ...super.asObject(),
            links: Array.from(this.rightStreamlines()).map(link => link.asObject()),
            children: this.children
                .filter(child => child.flow >= this.flowThreshold)
                .map(child => child.asObject()),
        };
    }

    * rightStreamlines(): Iterable<StreamlineLink> {
        for (let module of this.children) {
            // Skip if left module if below threshold
            if (module.flow < this.flowThreshold) continue;
            for (let group of module.children) {
                for (let streamlineNode of group.right.children) {
                    // Skip if right module is below threshold
                    const link: ?StreamlineLink = streamlineNode.link;
                    if (!link) continue;
                    const oppositeStreamlineNode: StreamlineNode = link.right;
                    const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(3);
                    if (oppositeModule && oppositeModule.flow < this.flowThreshold) continue;
                    if (streamlineNode.link) yield streamlineNode.link;
                }
            }
        }
    }

    sortChildren() {
        this.children.sort((a: Module, b: Module) => {
            let aSize = Math.max(1, a.path.length - 1);
            let bSize = Math.max(1, b.path.length - 1);
            let minSize = Math.min(aSize, bSize);
            for (let i = 0; i < minSize; ++i) {
                if (a.path[i] === b.path[i]) continue;
                return a.path[i] - b.path[i];
            }
            return b.flow - a.flow;
        });
    }
}
