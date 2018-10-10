// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Branch";
import Branch, { opposite, sideToString } from "./Branch";
import { STREAMLINE_NODE } from "./depth-constants";
import LeafNode from "./LeafNode";
import StreamlineLink from "./StreamlineLink";


export default class StreamlineNode extends AlluvialNodeBase {
    link: ?StreamlineLink = null;
    side: Side;

    constructor(networkIndex: number, parent: Branch, id: string) {
        super(networkIndex, parent, id);
        this.side = parent.side;
    }

    makeDangling() {
        this.id = this.id.split("--")[0];
    }

    get oppositeStreamlineNode(): ?StreamlineNode {
        if (this.link) {
            return this.link.left === this ? this.link.right : this.link.left;
        }
        return null;
    }

    get depth(): number {
        return STREAMLINE_NODE;
    }

    get byLink() {
        return this.link ? 0 : 1;
    }

    static createId(node: LeafNode,
                    networkIndex: number,
                    moduleLevel: number,
                    side: Side,
                    oppositeNode: ?LeafNode = null): string {

        const moduleId = node => node.ancestorAtLevel(moduleLevel);

        const typeSuffix = node => `${node.insignificant ? "i" : ""}${node.highlightIndex}`;

        const createId = (networkIndex, node, side) =>
            `${networkIndex}_module${moduleId(node)}_group${typeSuffix(node)}_${sideToString[side]}`;

        const id = createId(networkIndex, node, side);

        if (oppositeNode) {
            const oppositeId = createId(networkIndex + side, oppositeNode, opposite(side));
            return `${id}--${oppositeId}`;
        }

        return id;
    }
}
