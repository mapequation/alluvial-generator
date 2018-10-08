// @flow
import StreamlineNode from "./StreamlineNode";


export default class Branch {
    nodes: StreamlineNode[] = [];

    get flow(): number {
        return this.nodes.reduce((tot, node) => tot + node.flow, 0);
    }
}
