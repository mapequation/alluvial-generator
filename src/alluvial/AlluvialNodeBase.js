// @flow
import { HIGHLIGHT_GROUP, LEAF_NODE } from "./depth-constants";

type Position = {
  x: number,
  y: number
};

type Size = {
  width: number,
  height: number
};

type Layout = Position & Size;

export type AlluvialNode = $Subtype<AlluvialNodeBase>; // eslint-disable-line no-use-before-define

export type AlluvialNodeIterator = {
  child: AlluvialNode,
  childIndex: number,
  children: AlluvialNode[]
};

export type IteratorCallback = (
  child: AlluvialNode,
  childIndex: number,
  children: AlluvialNode[]
) => void;

export default class AlluvialNodeBase {
  flow: number = 0;
  networkId: string;
  id: string;

  x: number = 0;
  y: number = 0;
  height: number = 0;
  width: number = 0;

  +children: AlluvialNode[] = [];
  parent: ?AlluvialNode = null;

  constructor(
    networkId: string,
    parent: ?AlluvialNode = null,
    id: string = ""
  ) {
    this.networkId = networkId;
    this.parent = parent;
    this.id = id;
  }

  getAncestor(steps: number): ?AlluvialNode {
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

  getChild(index: number): ?AlluvialNode {
    if (index < 0 || index > this.children.length - 1) return null;
    return this.children[index];
  }

  sortChildren() {
    // no-op
  }

  asObject(): Object {
    return {
      id: this.id,
      networkId: this.networkId,
      flow: this.flow,
      depth: this.depth,
      ...this.layout,
      children: this.children.map(child => child.asObject())
    };
  }

  *traverseDepthFirst(preOrder: boolean = true): Iterable<AlluvialNode> {
    if (preOrder) {
      yield* this.traverseDepthFirstPreOrder();
    } else {
      yield* this.traverseDepthFirstPostOrder();
    }
  }

  *traverseDepthFirstPreOrder(): Iterable<AlluvialNode> {
    yield this;
    for (let child of this.children) {
      yield* child.traverseDepthFirstPreOrder();
    }
  }

  *traverseDepthFirstPostOrder(): Iterable<AlluvialNode> {
    for (let child of this.children) {
      yield* child.traverseDepthFirstPostOrder();
    }
    yield this;
  }

  *traverseDepthFirstWhile(
    predicate: Predicate<AlluvialNode>,
    preOrder: boolean = true
  ): Iterable<AlluvialNode> {
    if (preOrder) {
      yield* this.traverseDepthFirstPreOrderWhile(predicate);
    } else {
      yield* this.traverseDepthFirstPostOrderWhile(predicate);
    }
  }

  *traverseDepthFirstPreOrderWhile(
    predicate: Predicate<AlluvialNode>
  ): Iterable<AlluvialNode> {
    if (!predicate(this)) return;
    yield this;
    for (let child of this.children) {
      yield* child.traverseDepthFirstPreOrderWhile(predicate);
    }
  }

  *traverseDepthFirstPostOrderWhile(
    predicate: Predicate<AlluvialNode>
  ): Iterable<AlluvialNode> {
    for (let child of this.children) {
      yield* child.traverseDepthFirstPostOrderWhile(predicate);
    }
    if (!predicate(this)) return;
    yield this;
  }

  *childrenDepthFirstPreOrder(): Iterable<AlluvialNodeIterator> {
    const { children } = this;
    for (let childIndex = 0; childIndex < children.length; ++childIndex) {
      const child = children[childIndex];
      yield { child, childIndex, children };
      yield* child.childrenDepthFirstPreOrder();
    }
  }

  *childrenDepthFirstPostOrder(): Iterable<AlluvialNodeIterator> {
    const { children } = this;
    for (let childIndex = 0; childIndex < children.length; ++childIndex) {
      const child = children[childIndex];
      yield* child.childrenDepthFirstPostOrder();
      yield { child, childIndex, children };
    }
  }

  forEachDepthFirst(callback: IteratorCallback, preOrder: boolean = true) {
    if (preOrder) {
      this.forEachDepthFirstPreOrder(callback);
    } else {
      this.forEachDepthFirstPostOrder(callback);
    }
  }

  forEachDepthFirstWhile(
    predicate: Predicate<AlluvialNode>,
    callback: IteratorCallback,
    preOrder: boolean = true
  ) {
    if (preOrder) {
      this.forEachDepthFirstPreOrderWhile(predicate, callback);
    } else {
      this.forEachDepthFirstPostOrderWhile(predicate, callback);
    }
  }

  forEachDepthFirstPreOrder(callback: IteratorCallback) {
    const children = this.children;
    children.forEach((child, childIndex) => {
      callback(child, childIndex, children);
      child.forEachDepthFirstPreOrder(callback);
    });
  }

  forEachDepthFirstPostOrder(callback: IteratorCallback) {
    const children = this.children;
    children.forEach((child, childIndex) => {
      child.forEachDepthFirstPostOrder(callback);
      callback(child, childIndex, children);
    });
  }

  forEachDepthFirstPreOrderWhile(
    predicate: Predicate<AlluvialNode>,
    callback: IteratorCallback
  ) {
    const children = this.children.filter(predicate);
    children.forEach((child, childIndex) => {
      callback(child, childIndex, children);
      child.forEachDepthFirstPreOrderWhile(predicate, callback);
    });
  }

  forEachDepthFirstPostOrderWhile(
    predicate: Predicate<AlluvialNode>,
    callback: IteratorCallback
  ) {
    const children = this.children.filter(predicate);
    children.forEach((child, childIndex) => {
      child.forEachDepthFirstPostOrderWhile(predicate, callback);
      callback(child, childIndex, children);
    });
  }

  createForEachDepthFirstWhileIterator(
    predicate: Predicate<AlluvialNode>,
    preOrder: boolean = true
  ): IteratorCallback => void {
    if (preOrder) {
      return this.createForEachDepthFirstPreOrderWhileIterator(predicate);
    } else {
      return this.createForEachDepthFirstPostOrderWhileIterator(predicate);
    }
  }

  createForEachDepthFirstPreOrderWhileIterator(
    predicate: Predicate<AlluvialNode>
  ): IteratorCallback => void {
    return (callback: IteratorCallback) =>
      this.forEachDepthFirstPreOrderWhile(predicate, callback);
  }

  createForEachDepthFirstPostOrderWhileIterator(
    predicate: Predicate<AlluvialNode>
  ): IteratorCallback => void {
    return (callback: IteratorCallback) =>
      this.forEachDepthFirstPostOrderWhile(predicate, callback);
  }

  /*
  Note: If starting above the branching level, it only traverses leaf nodes
  of the left branch to not duplicate leaf nodes.
  */
  *leafNodes(): Iterable<AlluvialNode> {
    if (this.depth === LEAF_NODE) {
      yield this;
    }
    const children =
      this.depth === HIGHLIGHT_GROUP ? [this.children[0]] : this.children;
    for (let child of children) {
      yield* child.leafNodes();
    }
  }
}
