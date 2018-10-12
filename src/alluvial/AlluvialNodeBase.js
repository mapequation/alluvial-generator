// @flow
import { LEAF_NODE, HIGHLIGHT_GROUP } from "./depth-constants";


type Position = {
    x: number,
    y: number,
};

type Size = {
    width: number,
    height: number,
};

type Layout = Position & Size;

export type AlluvialNode = $Subtype<AlluvialNodeBase>; // eslint-disable-line no-use-before-define

export type AlluvialNodeBaseIterator = {
    child: AlluvialNode,
    childIndex: number,
    children: AlluvialNode[],
    nextChild: ?AlluvialNode,
};

export type IteratorCallback = (
    child: AlluvialNode,
    childIndex: number,
    children: AlluvialNode[],
    nextChild: ?AlluvialNode,
) => void;

export default class AlluvialNodeBase {
    flow: number = 0;
    networkIndex: number;
    id: string;

    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;
    marginTop: number = 0;

    +children: AlluvialNode[] = [];
    parent: ?AlluvialNode = null;

    constructor(networkIndex: number, parent: ?AlluvialNode = null, id: string = "") {
        this.networkIndex = networkIndex;
        this.parent = parent;
        this.id = id;
    }

    getAncestor(steps: number): ?AlluvialNodeBase {
        if (steps === 0) return this;
        if (!this.parent) return null;
        return this.parent.getAncestor(steps - 1);
    }

    get depth(): number {
        return 0;
    }

    get isEmpty(): boolean {
        return this.children.length === 0;
    }

    set layout({ x, y, width, height }: Layout) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get layout(): Layout {
        const { x, y, width, height } = this;
        return { x, y, width, height };
    }

    get byFlow() {
        return -this.flow;
    }

    addChild(node: AlluvialNode) {
        this.children.push(node);
    }

    removeChild(node: AlluvialNode) {
        const index = this.children.indexOf(node);
        const found = index > -1;
        if (found) {
            this.children.splice(index, 1);
        }
        return found;

    }

    sortChildren() {
        // no-op
    }

    asObject(): Object {
        return {
            id: this.id,
            networkIndex: this.networkIndex,
            flow: this.flow,
            depth: this.depth,
            layout: this.layout,
            children: this.children.map(child => child.asObject()),
        };
    }

    * traverseDepthFirst(preOrder: boolean = true): Iterable<AlluvialNodeBase> {
        if (preOrder) {
            yield* this.traverseDepthFirstPreOrder();
        } else {
            yield* this.traverseDepthFirstPostOrder();
        }
    }

    * traverseDepthFirstPreOrder(): Iterable<AlluvialNodeBase> {
        yield this;
        for (let child of this.children) {
            yield* child.traverseDepthFirstPreOrder();
        }
    }

    * traverseDepthFirstPostOrder(): Iterable<AlluvialNodeBase> {
        for (let child of this.children) {
            yield* child.traverseDepthFirstPostOrder();
        }
        yield this;
    }

    * traverseDepthFirstWhile(predicate: Predicate<AlluvialNodeBase>,
                              preOrder: boolean = true): Iterable<AlluvialNodeBase> {
        if (preOrder) {
            yield* this.traverseDepthFirstPreOrderWhile(predicate);
        } else {
            yield* this.traverseDepthFirstPostOrderWhile(predicate);
        }
    }

    * traverseDepthFirstPreOrderWhile(predicate: Predicate<AlluvialNodeBase>): Iterable<AlluvialNodeBase> {
        if (!predicate(this)) return;
        yield this;
        for (let child of this.children) {
            yield* child.traverseDepthFirstPreOrderWhile(predicate);
        }
    }

    * traverseDepthFirstPostOrderWhile(predicate: Predicate<AlluvialNodeBase>): Iterable<AlluvialNodeBase> {
        for (let child of this.children) {
            yield* child.traverseDepthFirstPostOrderWhile(predicate);
        }
        if (!predicate(this)) return;
        yield this;
    }

    * childrenDepthFirstPreOrder(): Iterable<AlluvialNodeBaseIterator> {
        const { children } = this;
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            const nextChild = i < children.length ? children[i + 1] : null;
            yield {
                child,
                childIndex: i,
                children,
                nextChild,
            };
            yield* child.childrenDepthFirstPreOrder();
        }
    }

    * childrenDepthFirstPostOrder(): Iterable<AlluvialNodeBaseIterator> {
        const { children } = this;
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            const nextChild = i < children.length ? children[i + 1] : null;
            yield* child.childrenDepthFirstPostOrder();
            yield {
                child,
                childIndex: i,
                children,
                nextChild,
            };
        }
    }

    forEachDepthFirst(callback: IteratorCallback, preOrder: boolean = true) {
        if (preOrder) {
            this.forEachDepthFirstPreOrder(callback);
        } else {
            this.forEachDepthFirstPostOrder(callback);
        }
    }

    forEachDepthFirstWhile(predicate: Predicate<AlluvialNodeBase>,
                           callback: IteratorCallback,
                           preOrder: boolean = true) {
        if (preOrder) {
            this.forEachDepthFirstPreOrderWhile(predicate, callback);
        } else {
            this.forEachDepthFirstPostOrderWhile(predicate, callback);
        }
    }

    forEachDepthFirstPreOrder(callback: IteratorCallback) {
        const children = this.children;
        children.forEach((child, i) => {
            const nextChild = i < children.length ? children[i + 1] : null;
            callback(child, i, children, nextChild);
            child.forEachDepthFirstPreOrder(callback);
        });
    }

    forEachDepthFirstPostOrder(callback: IteratorCallback) {
        const children = this.children;
        children.forEach((child, i) => {
            child.forEachDepthFirstPostOrder(callback);
            const nextChild = i < children.length ? children[i + 1] : null;
            callback(child, i, children, nextChild);
        });
    }

    forEachDepthFirstPreOrderWhile(predicate: Predicate<AlluvialNodeBase>, callback: IteratorCallback) {
        const children = this.children.filter(predicate);
        children.forEach((child, i) => {
            const nextChild = i < children.length ? children[i + 1] : null;
            callback(child, i, children, nextChild);
            child.forEachDepthFirstPreOrderWhile(predicate, callback);
        });
    }

    forEachDepthFirstPostOrderWhile(predicate: Predicate<AlluvialNodeBase>, callback: IteratorCallback) {
        const children = this.children.filter(predicate);
        children.forEach((child, i) => {
            child.forEachDepthFirstPostOrderWhile(predicate, callback);
            const nextChild = i < children.length ? children[i + 1] : null;
            callback(child, i, children, nextChild);
        });
    }

    /**
     Traverse leaf nodes.
     Note: If starting above the branching level, it only traverses leaf nodes
     of the left branch to not duplicate leaf nodes.
     */
    * traverseLeafNodes(): Iterable<AlluvialNodeBase> {
        if (this.depth === LEAF_NODE) {
            yield this;
        }
        const children = this.depth === HIGHLIGHT_GROUP ? [this.children[0]] : this.children;
        for (let child of children) {
            yield* child.traverseLeafNodes();
        }
    }
}
