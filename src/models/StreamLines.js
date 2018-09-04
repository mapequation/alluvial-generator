import { streamlineHorizontal } from "../lib/streamline";
import TreePath from "../lib/treepath";


export default class StreamLines {
    constructor(sourceModules, targetModules, moduleFlows, threshold, width) {
        this.sourceModules = sourceModules;
        this.targetModules = targetModules;
        this._moduleFlows = moduleFlows;
        this.threshold = threshold;
        this.width = width;
        this.xOffset = sourceModules.rightSide;
        this.streamlineGenerator = streamlineHorizontal();
    }

    get data() {
        return this._streamlinesWithCoordinates(this.sourceModules.data, this.targetModules.data, this._moduleFlows, this.threshold, this.width, this.xOffset);
    }

    _streamlinesWithCoordinates(sourceModules, targetModules, moduleFlows, threshold, width, xOffset) {
        const sourceOffsets = new Map();
        const targetOffsets = new Map();

        return moduleFlows
            .filter(({ sourceFlow, targetFlow }) => (sourceFlow + targetFlow) / 2 > threshold)
            .filter(({ sourcePath, targetPath }) =>
                sourceModules.some(m => m.path.equal(sourcePath)) &&
                targetModules.some(m => m.path.equal(targetPath)))
            .sort((a, b) => {
                const bySourcePath = a.sourcePath.rank - b.sourcePath.rank;
                const byTargetPath = a.targetPath.rank - b.targetPath.rank;
                const byFlow = b.sourceFlow + b.targetFlow - a.sourceFlow + a.targetFlow;
                return bySourcePath !== 0 ? bySourcePath : byTargetPath !== 0 ? byTargetPath : byFlow;
            })
            .map((moduleFlow) => {
                const { sourcePath, targetPath, sourceFlow, targetFlow } = moduleFlow;
                const sourceModule = sourceModules.find(m => m.path.equal(sourcePath));
                const targetModule = targetModules.find(m => m.path.equal(targetPath));
                const streamlineSource = this._streamlineHeightOffset(sourceFlow, sourceModule, sourceOffsets);
                const streamlineTarget = this._streamlineHeightOffset(targetFlow, targetModule, targetOffsets);
                return {
                    enterPath: this.streamlineGenerator([
                        [xOffset + width / 10, streamlineSource.offset],
                        [xOffset + width / 10, streamlineSource.offset],
                        [xOffset + width / 10, streamlineSource.offset - streamlineTarget.height],
                        [xOffset + width / 10, streamlineSource.offset - streamlineTarget.height],
                    ]),
                    path: this.streamlineGenerator([
                        [xOffset, streamlineSource.offset],
                        [xOffset + width, streamlineTarget.offset],
                        [xOffset + width, streamlineTarget.offset - streamlineTarget.height],
                        [xOffset, streamlineSource.offset - streamlineSource.height],
                    ]),
                    exitPath: this.streamlineGenerator([
                        [xOffset, 0],
                        [xOffset + width, 0],
                        [xOffset + width, 0],
                        [xOffset, 0],
                    ]),
                    ...moduleFlow,
                };
            });
    }

    _streamlineHeightOffset(flow, module, accumulatedOffsets) {
        const height = flow / module.flow * module.height;
        const streamlineOffset = accumulatedOffsets.get(module.path.toString()) || 0;
        const offset = module.y + module.height + streamlineOffset;
        accumulatedOffsets.set(module.path.toString(), streamlineOffset - height);
        return { height, offset };
    }

    static moduleFlows(sourceNodes, targetNodes, parent = TreePath.root()) {
        const targetNodesByName = new Map(targetNodes.map(node => [node.name, node]));

        const sourceNodesWithTarget = sourceNodes.filter(node => targetNodesByName.has(node.name));
        const sourceNodesBelowParent = sourceNodesWithTarget.filter(node => parent.isAncestor(node.path));

        return sourceNodesBelowParent.reduce((moduleFlows, sourceNode) => {
            const targetNode = targetNodesByName.get(sourceNode.name);

            const sourceAncestorPath = sourceNode.path.ancestorAtLevel(parent.level + 1);
            const targetAncestorPath = targetNode.path.ancestorAtLevel(parent.level + 1);

            const found = moduleFlows.find(each =>
                each.sourcePath.equal(sourceAncestorPath) &&
                each.targetPath.equal(targetAncestorPath));

            if (found) {
                found.sourceFlow += sourceNode.flow;
                found.targetFlow += targetNode.flow;
            } else {
                moduleFlows.push({
                    sourcePath: sourceAncestorPath,
                    targetPath: targetAncestorPath,
                    sourceFlow: sourceNode.flow,
                    targetFlow: targetNode.flow,
                });
            }
            return moduleFlows;
        }, []);
    }
}
