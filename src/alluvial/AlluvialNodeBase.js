import Depth from './depth-constants';
// @flow
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
            yield* child.traverseDepthFirst();
        }
    }

    * traverseDepthFirstPostOrder(): Iterable<AlluvialNodeBase> {
        for (let child of this.children) {
            yield* child.traverseDepthFirstPostOrder();
        }
        yield this;
    }

    * traverseDepthFirstWhile(predicate: (AlluvialNodeBase) => boolean, preOrder: boolean = true): Iterable<AlluvialNodeBase> {
        if (preOrder) {
            yield* this.traverseDepthFirstPreOrderWhile(predicate);
        } else {
            yield* this.traverseDepthFirstPostOrderWhile(predicate);
        }
    }

    * traverseDepthFirstPreOrderWhile(predicate: (AlluvialNodeBase) => boolean): Iterable<AlluvialNodeBase> {
        if (!predicate(this)) return;
        yield this;
        for (let child of this.children) {
            yield* child.traverseDepthFirstPreOrderWhile(predicate);
        }
    }

    * traverseDepthFirstPostOrderWhile(predicate: (AlluvialNodeBase) => boolean): Iterable<AlluvialNodeBase> {
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
            yield {
                child,
                childIndex: i,
                children: children,
                nextChild: i === children.length - 1 ? null : children[i + 1],
            };
            yield* child.childrenDepthFirstPreOrder();
        }
    }

    * childrenDepthFirstPostOrder(): Iterable<AlluvialNodeBaseIterator> {
        const { children } = this;
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            yield* child.childrenDepthFirstPostOrder();
            yield {
                child,
                childIndex: i,
                children: children,
                nextChild: i === children.length - 1 ? null : children[i + 1],
            };
        }
    }

    forEachDepthFirst(callback: IteratorCallback, preOrder: boolean = true): void {
        if (preOrder) {
            this.forEachDepthFirstPreOrder(callback);
        } else {
            this.forEachDepthFirstPostOrder(callback);
        }
    }

    forEachDepthFirstWhile(predicate: (AlluvialNodeBase) => boolean, callback: IteratorCallback, preOrder: boolean = true): void {
        if (preOrder) {
            this.forEachDepthFirstPreOrderWhile(predicate, callback);
        } else {
            this.forEachDepthFirstPostOrderWhile(predicate, callback);
        }
    }

    forEachDepthFirstPreOrder(callback: IteratorCallback): void {
        const children = this.children;
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            callback(
                child,
                i,
                children,
                i + 1 === children.length ? null : children[i + 1],
            );
            child.forEachDepthFirstPreOrder(callback);
        }
    }

    forEachDepthFirstPostOrder(callback: IteratorCallback): void {
        const children = this.children;
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            child.forEachDepthFirstPreOrder(callback);
            callback(
                child,
                i,
                children,
                i + 1 === children.length ? null : children[i + 1],
            );
        }
    }

    forEachDepthFirstPreOrderWhile(predicate: (AlluvialNodeBase) => boolean, callback: IteratorCallback): void {
        const children = this.children.filter(predicate);
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            callback(
                child,
                i,
                children,
                i + 1 === children.length ? null : children[i + 1],
            );
            child.forEachDepthFirstPreOrderWhile(predicate, callback);
        }
    }

    forEachDepthFirstPostOrderWhile(predicate: (AlluvialNodeBase) => boolean, callback: IteratorCallback): void {
        const children = this.children.filter(predicate);
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            child.forEachDepthFirstPreOrderWhile(predicate, callback);
            callback(
                child,
                i,
                children,
                i + 1 === children.length ? null : children[i + 1],
            );
        }
    }

    /**
    Traverse leaf nodes.
    Note: If starting above the branching level, it only traverses leaf nodes
    of the left branch to not duplicate leaf nodes.
     */
    * traverseLeafNodes(): Iterable<AlluvialNodeBase> {
        if (this.depth === Depth.LEAF_NODE) {
            yield this;
        }
        // Only traverse into left branch to not duplicate leaf nodes
        const children = this.depth === Depth.HIGHLIGHT_GROUP ? [this.children[0]] : this.children;
        for (let child of children) {
            yield* child.traverseLeafNodes();
        }
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
}
