// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import StreamlineNode from "./StreamlineNode";


export type Side = -1 | 1;

export const LEFT: Side = -1;
export const RIGHT: Side = 1;

export default class Branch extends AlluvialNodeBase {
    streamlineNodes: StreamlineNode[] = [];
    side: Side;

    constructor(side: Side, networkIndex: number) {
        super(networkIndex);
        this.side = side;
    }

    get neighborNetworkIndex(): number {
        return this.networkIndex + this.side;
    }

    addStreamlineNode(streamlineNode: StreamlineNode): void {
        this.streamlineNodes.push(streamlineNode);
    }
}
