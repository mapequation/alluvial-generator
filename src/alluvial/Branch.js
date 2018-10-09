// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import StreamlineNode from "./StreamlineNode";


export type Side = -1 | 1;

export const LEFT: Side = -1;
export const RIGHT: Side = 1;

export default class Branch extends AlluvialNodeBase {
    children: StreamlineNode[] = [];
    side: Side;

    constructor(side: Side, networkIndex: number) {
        super(networkIndex);
        this.side = side;
    }

    static createLeft(networkIndex: number): Branch {
        return new Branch(LEFT, networkIndex);
    }

    static createRight(networkIndex: number): Branch {
        return new Branch(RIGHT, networkIndex);
    }

    get neighborNetworkIndex(): number {
        return this.networkIndex + this.side;
    }

    addStreamlineNode(streamlineNode: StreamlineNode): void {
        this.children.push(streamlineNode);
    }

    get isLeft(): boolean {
        return this.side === LEFT;
    }

    get isRight(): boolean {
        return this.side === RIGHT;
    }

    get depth(): number {
        return 4;
    }

    asObject(): Object {
        return {
            ...super.asObject(),
            side: this.isLeft ? "left" : "right",
        };
    }
}
