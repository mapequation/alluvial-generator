import { Depth } from "./Depth";
import LeafNode from "./LeafNode";

class Layout {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;

  get layout() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  set layout({
    x,
    y,
    width,
    height,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

type ToArray<T> = T extends any ? T[] : never;

export type Predicate<Item> = (value: Item, index?: number) => boolean;

export type IteratorCallback<ChildType> = (
  child: ChildType,
  childIndex: number,
  children: ChildType[]
) => void;

type Parent<T> = T extends {
  parent: infer ParentType;
}
  ? ParentType
  : never;

export type Ancestors<T> =
  | T
  | NonNullable<
      | Parent<T>
      | Parent<Parent<T>>
      | Parent<Parent<Parent<T>>>
      | Parent<Parent<Parent<Parent<T>>>>
      | Parent<Parent<Parent<Parent<Parent<T>>>>>
      | Parent<Parent<Parent<Parent<Parent<Parent<T>>>>>>
      | Parent<Parent<Parent<Parent<Parent<Parent<Parent<T>>>>>>>
    >;

type Child<T> = T extends {
  children: Array<infer ChildType>;
}
  ? ChildType
  : never;

export type Descendants<T> = NonNullable<
  | Child<T>
  | Child<Child<T>>
  | Child<Child<Child<T>>>
  | Child<Child<Child<Child<T>>>>
  | Child<Child<Child<Child<Child<T>>>>>
  | Child<Child<Child<Child<Child<Child<T>>>>>>
  | Child<Child<Child<Child<Child<Child<Child<T>>>>>>>
>;

export default abstract class AlluvialNode<
  ChildType extends AlluvialNode<any, any>,
  ParentType extends AlluvialNode<any, any> | null = null
> extends Layout {
  abstract readonly depth: Depth;

  flow: number = 0;

  children: ChildType[] = [];

  protected constructor(
    public parent: ParentType,
    public readonly networkId: string,
    public readonly id: string = ""
  ) {
    super();
  }

  get isFirstChild() {
    return this.parent?.children.findIndex((child) => child === this) === 0;
  }

  get isLastChild() {
    const numChildren = this.parent?.children.length ?? -1;
    return (
      this.parent?.children.findIndex((child) => child === this) ===
      numChildren - 1
    );
  }

  get isEmpty() {
    return this.children.length === 0;
  }

  get numLeafNodes(): number {
    return this.children.reduce(
      (num, children) => num + children.numLeafNodes,
      0
    );
  }

  getAncestor(depth: Depth): Ancestors<this> | null {
    if (this.depth === depth) return this;
    if (!this.parent || this.depth < depth) return null;
    return this.parent.getAncestor(depth);
  }

  addChild(node: ChildType) {
    return this.children.push(node);
  }

  removeChild(node: ChildType) {
    const index = this.children.indexOf(node);
    const found = index > -1;
    if (found) {
      this.children[index] = this.children[this.children.length - 1];
      this.children.pop();
    }

    return found;
  }

  *leafNodes(): Iterable<LeafNode> {
    for (let child of this) {
      yield* child.leafNodes();
    }
  }

  [Symbol.iterator](): Iterator<ChildType> {
    return this.children.values();
  }

  forEachDepthFirst(
    callback: IteratorCallback<ChildType>,
    preOrder: boolean = true
  ) {
    return preOrder
      ? this.forEachDepthFirstPreOrder(callback)
      : this.forEachDepthFirstPostOrder(callback);
  }

  forEachDepthFirstPreOrder(callback: IteratorCallback<ChildType>) {
    const children = this.children;
    children.forEach((child, childIndex) => {
      callback(child, childIndex, children);
      child.forEachDepthFirstPreOrder(callback);
    });
  }

  forEachDepthFirstPostOrder(callback: IteratorCallback<ChildType>) {
    const children = this.children;
    children.forEach((child, childIndex) => {
      child.forEachDepthFirstPostOrder(callback);
      callback(child, childIndex, children);
    });
  }

  forEachDepthFirstWhile(
    predicate: Parameters<ToArray<Descendants<this>>["filter"]>[0],
    callback: Parameters<ToArray<Descendants<this>>["forEach"]>[0],
    preOrder: boolean = true
  ): void {
    return preOrder
      ? this.forEachDepthFirstPreOrderWhile(predicate, callback)
      : this.forEachDepthFirstPostOrderWhile(predicate, callback);
  }

  forEachDepthFirstPreOrderWhile(
    predicate: Parameters<ToArray<Descendants<this>>["filter"]>[0],
    callback: Parameters<ToArray<Descendants<this>>["forEach"]>[0]
  ) {
    const children = this.children.filter(predicate);
    children.forEach((child, childIndex) => {
      callback(child, childIndex, children);
      child.forEachDepthFirstPreOrderWhile(predicate, callback);
    });
  }

  forEachDepthFirstPostOrderWhile(
    predicate: Parameters<ToArray<Descendants<this>>["filter"]>[0],
    callback: Parameters<ToArray<Descendants<this>>["forEach"]>[0]
  ) {
    const children = this.children.filter(predicate);
    children.forEach((child, childIndex) => {
      child.forEachDepthFirstPostOrderWhile(predicate, callback);
      callback(child, childIndex, children);
    });
  }
}
