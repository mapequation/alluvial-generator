// @flow
import type { Depth } from "./Depth";


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

export type IteratorCallback = (
  child: AlluvialNode,
  childIndex: number,
  children: AlluvialNode[]
) => void;

export default class AlluvialNodeBase {
  flow: number = 0;
  networkId: string;
  id: string;
  depth: Depth = 0;

  x: number = 0;
  y: number = 0;
  height: number = 0;
  width: number = 0;

  +children: AlluvialNode[] = [];
  parent: ?AlluvialNode = null;

  constructor(parent: ?AlluvialNode, networkId: string, id: string = "") {
    this.networkId = networkId;
    this.parent = parent;
    this.id = id;
  }

  getAncestor(depth: Depth): ?AlluvialNode {
    if (this.depth === depth) return this;
    if (!this.parent || this.depth < depth) return null;
    return this.parent.getAncestor(depth);
  }

  get numLeafNodes(): number {
    return this.children.reduce((num, children) => num + children.numLeafNodes, 0);
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

  addChild(node: AlluvialNode) {
    return this.children.push(node);
  }

  removeChild(node: AlluvialNode) {
    const index = this.children.indexOf(node);
    const found = index > -1;
    if (found) {
      this.children[index] = this.children[this.children.length - 1];
      this.children.pop();
    }
    if (!this.children.length) {
      this.flow = 0;
    }
    return found;
  }

  getChild(index: number): ?AlluvialNode {
    if (index < 0 || index > this.children.length - 1) return null;
    return this.children[index];
  }

  get numChildren(): number {
    return this.children.length;
  }

  get isEmpty(): boolean {
    return this.numChildren === 0;
  }

  removeFromParent() {
    if (!this.parent) return;
    this.parent.removeChild(this);
  }

  sortChildren() {
    // no-op
  }

  sortBy(compareFn: (a: AlluvialNode, b: AlluvialNode) => number) {
    this.children.sort(compareFn);
  }

  /*:: @@iterator(): Iterator<AlluvialNode> { return this.children.values() } */

  // $FlowFixMe - computed property
  [Symbol.iterator](): Iterator<AlluvialNode> {
    return this.children.values();
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

  forEachDepthFirst(callback: IteratorCallback, preOrder: boolean = true) {
    return preOrder ? this.forEachDepthFirstPreOrder(callback) : this.forEachDepthFirstPostOrder(callback);
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

  forEachDepthFirstWhile(
    predicate: Predicate<AlluvialNode>,
    callback: IteratorCallback,
    preOrder: boolean = true
  ) {
    return preOrder
      ? this.forEachDepthFirstPreOrderWhile(predicate, callback)
      : this.forEachDepthFirstPostOrderWhile(predicate, callback);
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

  * leafNodes(): Iterable<AlluvialNode> {
    for (let child of this) {
      yield* child.leafNodes();
    }
  }
}
