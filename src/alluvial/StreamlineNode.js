// @flow
import Node from "./Node";
import StreamlineLink from "./StreamlineLink";


export default class StreamlineNode {
    link: ?StreamlineLink = null;
    nodes: Node[] = [];

    add(node: Node): void {
        this.nodes.push(node);
    }

    get flow(): number {
        return this.nodes.reduce((tot, node) => tot + node.flow, 0);
    }
}
