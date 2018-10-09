// @flow
import type { Node } from "../io/parse-ftree";
import AlluvialNodeBase from "./AlluvialNodeBase";
import StreamlineLink from "./StreamlineLink";


export default class StreamlineNode extends AlluvialNodeBase {
    link: ?StreamlineLink = null;
    nodes: Node[] = [];

    addNode(node: Node): void {
        this.nodes.push(node);
        this.flow += node.flow;
    }

    get depth(): number {
        return 5;
    }

    asObject(): Object {
        return {
            depth: this.depth,
            layout: this.layout,
            children: this.nodes,
            link: this.link ? this.link.asObject() : null,
        };
    }
}
