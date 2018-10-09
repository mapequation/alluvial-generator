// @flow
import StreamlineNode from "./StreamlineNode";


export default class StreamlineLink {
    left: StreamlineNode;
    right: StreamlineNode;

    constructor(left: StreamlineNode, right: StreamlineNode, reverse: boolean = false) {
        this.left = reverse ? right : left;
        this.right = reverse ? left : right;
        left.link = this;
        right.link = this;
    }

    static create(left: StreamlineNode, right: StreamlineNode, reverse: boolean = false) {
        return new StreamlineLink(left, right, reverse);
    }

    asObject() {
        return {
            left: this.left.layout,
            right: this.right.layout,
        };
    }
}
