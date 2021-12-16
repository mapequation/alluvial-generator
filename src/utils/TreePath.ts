type Path = TreePath | string | number[];

const insignificantPathRexeg = /(\d+)([:;])+/g;

/**
 * Class that represents a path in a tree
 */
export default class TreePath {
  path: string;
  pathArr: string[];
  insignificant: boolean[] = [];
  ancestorPaths: Map<number, string> = new Map();

  /**
   * Construct a new TreePath
   */
  constructor(path: Path) {
    this.path = Array.isArray(path) ? path.join(":") : path.toString();

    const lastChar = this.path.slice(-1);

    if (lastChar === ";") {
      // node is insignificant at some level
      this.pathArr = [];
      const matches = this.path.matchAll(insignificantPathRexeg);

      for (let match of matches) {
        this.pathArr.push(match[1]);
        this.insignificant.push(match[2] === ";");
      }
    } else {
      if (lastChar === ":") {
        // remove last colon if we have stree path
        this.path = this.path.slice(0, -1);
      }

      this.pathArr = this.path.split(":");
      this.insignificant = this.pathArr.map(() => false);
    }

    this.ancestorPaths.set(0, "root");
    for (let level = 1; level < this.pathArr.length; level++) {
      this.ancestorPaths.set(level, this.pathArr.slice(0, level).join(":"));
    }
  }

  get level() {
    return this.isRoot() ? 0 : this.pathArr.length;
  }

  get rank() {
    if (TreePath.isRoot(this)) return 0;
    const asArray = this.toArray();
    return asArray[asArray.length - 1];
  }

  /**
   * Construct a new TreePath
   */
  static fromArray(path: number[] | string[]) {
    return !path.length ? TreePath.root() : new TreePath(path.join(":"));
  }

  /**
   * Construct a TreePath from two paths
   */
  static join(parentPath: Path, path: Path) {
    if (TreePath.isRoot(parentPath)) {
      return new TreePath(path);
    }
    return TreePath.fromArray([parentPath.toString(), path.toString()]);
  }

  /**
   * Get the root
   */
  static root() {
    return new TreePath("root");
  }

  static isRoot(treePath: Path) {
    return treePath.toString() === "root";
  }

  static equal(a: Path, b: Path) {
    return a.toString() === b.toString();
  }

  static isAncestor(parent: Path, child: Path) {
    if (TreePath.isRoot(parent)) return true;

    const p = parent.toString();
    const c = child.toString();

    if (p.length >= c.length) return false;

    return c.startsWith(p);
  }

  static level(treePath: Path) {
    return TreePath.isRoot(treePath) ? 0 : TreePath.toArray(treePath).length;
  }

  static ancestorAtLevel(treePath: Path, level: number) {
    if (level === 0) return TreePath.root();
    return TreePath.fromArray(TreePath.toArray(treePath).slice(0, level));
  }

  static isParentOf(parent: Path, child: Path) {
    const p = TreePath.parentPath(child);
    if (!p) return false;
    return TreePath.equal(parent, p);
  }

  /**
   * Get the path to the node one step up in the hierarchy.
   *
   * > TreePath.parentPath("root")
   * null
   * > TreePath.parentPath(1)
   * new TreePath("root")
   * > TreePath.parentPath("1:1")
   * new TreePath("1")
   */
  static parentPath(path: Path) {
    if (!TreePath.isTreePath(path)) {
      return null;
    }

    if (TreePath.toArray(path).length === 1) {
      return TreePath.root();
    }

    const p = path.toString();
    return new TreePath(p.substr(0, p.lastIndexOf(":"))); // FIXME substr is deprecated
  }

  /**
   * Split a tree path string to array and parse to integer.
   *
   * > TreePath.toArray('1:1')
   * [1, 1]
   * > TreePath.toArray('1')
   * [1]
   * > TreePath.toArray(1)
   * [1]
   * > TreePath.toArray('root')
   * [ NaN ]
   */
  static toArray(path: Path) {
    return path.toString().split(":").map(Number);
  }

  /**
   * Check if path matches the format 1:1:1
   * (repeating digit and colon ending with digit)
   */
  static isTreePath(path: Path) {
    return /^(\d+:)*\d+$/.test(path.toString());
  }

  /**
   * Create a DOM friendly id
   */
  toId() {
    let path = this.toString();

    if (TreePath.isTreePath(path)) {
      path = path.replace(/:/g, "-");
    }

    return `id-${path}`;
  }

  isRoot() {
    return this.path === "root";
  }

  equal(other: Path) {
    return TreePath.equal(this, other);
  }

  isAncestor(child: Path) {
    return TreePath.isAncestor(this, child);
  }

  ancestorAtLevel(level: number) {
    return TreePath.ancestorAtLevel(this, level);
  }

  ancestorAtLevelAsString(level: number) {
    return this.ancestorPaths.get(level) || this.path;
  }

  isParentOf(child: Path) {
    return TreePath.isParentOf(this, child);
  }

  /**
   * Get the path to the node one step up in the hierarchy.
   */
  parentPath() {
    return TreePath.parentPath(this.toString());
  }

  /**
   * Get path as string
   */
  toString() {
    return this.path;
  }

  /**
   * Get path as array
   */
  toArray() {
    return TreePath.toArray(this.path);
  }
}
