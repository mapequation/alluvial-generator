import AlluvialModule from "./AlluvialModule";
import AlluvialStreamline from "./AlluvialStreamline";


export default class AlluvialBranch {
    module: AlluvialModule;
    streamlines: AlluvialStreamline[] = [];

    constructor(module: AlluvialModule) {
        this.module = module;
    }

    getStreamlineToRight(right: AlluvialBranch): AlluvialStreamline {
        return this.getStreamline(this, right);
    }

    getStreamline(left: AlluvialBranch, right: AlluvialBranch): AlluvialStreamline {
        return this.findStreamline(left, right) || new AlluvialStreamline(left, right);
    }

    findStreamline(left: AlluvialBranch, right: AlluvialBranch): ?AlluvialStreamline {
        return this.streamlines.find(streamline => streamline.left === left && streamline.right === right);
    }
}
