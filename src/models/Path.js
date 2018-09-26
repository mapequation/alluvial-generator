import TreePath from "../lib/treepath";


export default class Path {
    +path: TreePath;
    -_level: ?number = null;
    -_rank: ?number = null;

    constructor(path) {
        this.path = new TreePath(path);
    }

    get rank() {
        if (!this._rank) this._rank = this.path.rank;
        return this._rank;
    }

    get level() {
        if (!this._level) this._level = this.path.level;
        return this._level;
    }
}
