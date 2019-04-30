// @flow
type Path = TreePath | string; // eslint-disable-line no-use-before-define

/**
 * Class that represents a path in a tree
 */
export default class TreePath {
  path: string;
  pathArr: string[];
  ancestorPaths: Map<number, string> = new Map();


  /**
   * Construct a new TreePath
   */
  constructor(path: Path) {
    this.path = path.toString();
    this.pathArr = this.path.split(":");
    this.ancestorPaths.set(0, "root");
    for (let level = 1; level < this.pathArr.length; level++) {
      this.ancestorPaths.set(level, this.pathArr.slice(0, level).join(":"));
    }
  }

  /**
   * Construct a new TreePath
   */
  static fromArray(path: $ReadOnlyArray<number | string>): TreePath {
    return !path.length ? TreePath.root() : new TreePath(path.join(":"));
  }

  /**
   * Construct a TreePath from two paths
   */
  static join(parentPath: Path, path: Path): TreePath {
    if (TreePath.isRoot(parentPath)) {
      return new TreePath(path);
    }
    return TreePath.fromArray([parentPath.toString(), path.toString()]);
  }

  /**
   * Create a DOM friendly id
   */
  toId(): string {
    let path = this.toString();

    if (TreePath.isTreePath(path)) {
      path = path.replace(/:/g, "-");
    }

    return `id-${path}`;
  }

  /**
   * Get the root
   */
  static root(): TreePath {
    return new TreePath("root");
  }

  isRoot() {
    return this.path === "root";
  }

  static isRoot(treePath: Path) {
    return treePath.toString() === "root";
  }

  equal(other: Path): boolean {
    return TreePath.equal(this, other);
  }

  static equal(a: Path, b: Path): boolean {
    return a.toString() === b.toString();
  }

  isAncestor(child: Path): boolean {
    return TreePath.isAncestor(this, child);
  }

  static isAncestor(parent: Path, child: Path): boolean {
    if (TreePath.isRoot(parent)) return true;

    const p = parent.toString();
    const c = child.toString();

    if (p.length >= c.length) return false;

    return c.startsWith(p);
  }

  get level(): number {
    return this.isRoot() ? 0 : this.pathArr.length;
  }

  static level(treePath: Path): number {
    return TreePath.isRoot(treePath) ? 0 : TreePath.toArray(treePath).length;
  }

  get rank(): number {
    if (TreePath.isRoot(this)) return 0;
    const asArray = this.toArray();
    return asArray[asArray.length - 1];
  }

  ancestorAtLevel(level: number): TreePath {
    return TreePath.ancestorAtLevel(this, level);
  }

  ancestorAtLevelAsString(level: number): string {
    return this.ancestorPaths.get(level) || this.path;
  }

  static ancestorAtLevel(treePath: Path, level: number): TreePath {
    if (level === 0) return TreePath.root();
    return TreePath.fromArray(TreePath.toArray(treePath).slice(0, level));
  }

  isParentOf(child: Path): boolean {
    return TreePath.isParentOf(this, child);
  }

  static isParentOf(parent: Path, child: Path): boolean {
    const p = TreePath.parentPath(child);
    if (!p) return false;
    return TreePath.equal(parent, p);
  }

  /**
   * Get the path to the node one step up in the hierarchy.
   *
   * @see TreePath.parentPath
   */
  parentPath(): ?TreePath {
    return TreePath.parentPath(this.toString());
  }

  /**
   * Get the path to the node one step up in the hierarchy.
   *
   * @example
   * > TreePath.parentPath("root")
   * null
   * > TreePath.parentPath(1)
   * new TreePath("root")
   * > TreePath.parentPath("1:1")
   * new TreePath("1")
   */
  static parentPath(path: Path): ?TreePath {
    if (!TreePath.isTreePath(path)) {
      return null;
    }

    if (TreePath.toArray(path).length === 1) {
      return TreePath.root();
    }

    const p = path.toString();
    return new TreePath(p.substr(0, p.lastIndexOf(":")));
  }

  /**
   * Get path as string
   */
  toString(): string {
    return this.path;
  }

  /**
   * Get path as array
   *
   * @see TreePath.toArray
   */
  toArray(): number[] {
    return TreePath.toArray(this.path);
  }

  /**
   * Split a tree path string to array and parse to integer.
   *
   * @example
   * > TreePath.toArray('1:1')
   * [1, 1]
   * > TreePath.toArray('1')
   * [1]
   * > TreePath.toArray(1)
   * [1]
   * > TreePath.toArray('root')
   * [ NaN ]
   */
  static toArray(path: Path): number[] {
    return path
      .toString()
      .split(":")
      .map(Number);
  }

  /**
   * Check if path matches the format 1:1:1
   * (repeating digit and colon ending with digit)
   */
  static isTreePath(path: Path): boolean {
    return /^(\d+:)*\d+$/.test(path.toString());
  }
}
