// @flow
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import StreamlineNode from "./StreamlineNode";


export type Side = -1 | 1;

export const LEFT: Side = -1;
export const RIGHT: Side = 1;

export const sideToString = {
    [LEFT]: "left",
    [RIGHT]: "right",
};

export const opposite = (side: Side): Side => side === LEFT ? RIGHT : LEFT;

export default class Branch extends AlluvialNodeBase {
    children: StreamlineNode[] = [];
    side: Side;

    constructor(side: Side, networkIndex: number, parent: AlluvialNode) {
        super(networkIndex, parent);
        this.side = side;
    }

    static createLeft(networkIndex: number, parent: AlluvialNode): Branch {
        return new Branch(LEFT, networkIndex, parent);
    }

    static createRight(networkIndex: number, parent: AlluvialNode): Branch {
        return new Branch(RIGHT, networkIndex, parent);
    }

    get neighborNetworkIndex(): number {
        return this.networkIndex + this.side;
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
