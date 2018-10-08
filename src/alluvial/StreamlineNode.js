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
}
