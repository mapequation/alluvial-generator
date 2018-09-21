import TreePath from "../lib/treepath";


export default class Path {
    +path: TreePath;

    constructor(path) {
        this.path = new TreePath(path);
    }

    get rank() {
        return this.path.rank;
    }

    get level() {
        return this.path.level;
    }
}
