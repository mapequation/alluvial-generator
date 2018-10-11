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

    * rightStreamlineNodes(): Iterable<StreamlineNode> {
        for (let module of this.children) {
            if (module.flow < this.flowThreshold) {
                // Skip left module if below threshold
                continue;
            }
            for (let group of module.children) {
                for (let streamlineNode of group.right.children) {
                    // Skip right streamline if right module is below threshold
                    const link: ?StreamlineLink = streamlineNode.link;
                    if (!link) continue;
                    const oppositeStreamlineNode: StreamlineNode = link.right;
                    const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(3);
                    if (oppositeModule && oppositeModule.flow < this.flowThreshold) continue;
                    yield streamlineNode;
                }
            }
        }
    }

    * rightStreamlines(): Iterable<StreamlineLink> {
        for (let streamlineNode of this.rightStreamlineNodes()) {
            if (streamlineNode.link) yield streamlineNode.link;
        }
    }

    sortChildren() {
        this.children.sort((a, b) => b.flow - a.flow);
    }
}
