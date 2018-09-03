/**
 * Class that represents a path in a tree
 *
 * @author Anton Eriksson
 */
export default class TreePath {
    static _root = null;

    /**
     * Construct a new TreePath
     *
     * @param {number|string} path
     */
    constructor(path) {
        this.path = path.toString();
    }

    /**
     * Construct a new TreePath
     *
     * @param {string[]|number[]} path
     */
    static fromArray(path) {
        return !path.length ? TreePath.root() : new TreePath(path.join(":"));
    }

    /**
     * Construct a TreePath from two paths
     *
     * @param {TreePath|string} parentPath
     * @param {string|number} path
     */
    static join(parentPath, path) {
        if (TreePath.isRoot(parentPath)) {
            return new TreePath(path);
        }
        return TreePath.fromArray([parentPath.toString(), path.toString()]);
    }

    /**
     * Get the root
     *
     * @returns {TreePath} the root TreePath
     */
    static root() {
        if (!TreePath._root) {
            TreePath._root = new TreePath("root");
        }
        return TreePath._root;
    }

    static isRoot(treePath) {
        return treePath === TreePath.root();
    }

    /**
     * Create a DOM friendly id
     *
     * @return {string} the id
     */
    toId() {
        let path = this.toString();

        if (TreePath.isTreePath(path)) {
            path = path.replace(/:/g, "-");
        }

        return `id-${path}`;
    }

    equal(other) {
        return TreePath.equal(this, other);
    }

    static equal(a, b) {
        return a.toString() === b.toString();
    }

    isAncestor(child) {
        if (TreePath.isRoot(this)) return true;

        const childArr = child.toArray();
        return this.toArray().every((step, i) => step === childArr[i]);
    }

    isDescendant(parent) {
        if (TreePath.isRoot(parent)) return true;

        let parentPath = this.parentPath();

        while (!TreePath.isRoot(parentPath)) {
            if (parentPath.equal(parent)) return true;
            parentPath = parentPath.parentPath();
        }

        return false;
    }

    get level() {
        return TreePath.isRoot(this) ? 0 : this.toArray().length;
    }

    ancestorAtLevel(level) {
        if (level === 0) return TreePath.root();
        return TreePath.fromArray(this.toArray().slice(0, level));
    }

    get rank() {
        if (TreePath.isRoot(this)) return 0;
        const asArray = this.toArray();
        return asArray[asArray.length - 1];
    }

    /**
     * Get the path to the node one step up in the hierarchy.
     *
     * @see TreePath.parentPath
     *
     * @returns {?TreePath} the parent path
     */
    parentPath() {
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
     *
     * @returns {?TreePath} the parent path
     */
    static parentPath(path) {
        if (!TreePath.isTreePath(path)) {
            return null;
        }

        if (TreePath.toArray(path).length === 1) {
            return TreePath.root();
        }

        return new TreePath(path.substr(0, path.lastIndexOf(":")));
    }

    /**
     * Get path as string
     *
     * @return {string} the path
     */
    toString() {
        return this.path;
    }

    /**
     * Get path as array
     *
     * @see TreePath.toArray
     *
     * @return {number[]}
     */
    toArray() {
        return TreePath.toArray(this.path);
    }

    /**
     * Iterate over steps in path
     *
     * @return {IterableIterator<*>} an iterator
     */
    [Symbol.iterator]() {
        return TreePath.isRoot(this) ? [this.toString()].values() : this.toArray().values();
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
     *
     * @param {string|number} path A string in format "1:1:2:1"
     * @return {number[]}
     */
    static toArray(path) {
        return path
            .toString()
            .split(":")
            .map(Number);
    }

    /**
     * Check if path matches the format 1:1:1
     * (repeating digit and colon ending with digit)
     *
     * @param {*} path
     * @return {boolean}
     */
    static isTreePath(path) {
        return /^(\d+:)*\d+$/.test(path.toString());
    }
}
