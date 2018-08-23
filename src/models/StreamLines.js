import { streamlineHorizontal } from "../helpers/streamline";


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
            .filter(({ sourceFlow, targetFlow }) => sourceFlow > threshold || targetFlow > threshold)
            .filter(({ sourcePath, targetPath }) =>
                sourceModules.some(m => m.id.toString() === sourcePath) && targetModules.some(m => m.id.toString() === targetPath))
            .sort((a, b) => {
                const sourcePath = a.sourcePath - b.sourcePath;
                const targetPath = a.targetPath - b.targetPath;
                const flow = b.sourceFlow + b.targetFlow - a.sourceFlow + a.targetFlow;
                return sourcePath !== 0 ? sourcePath : targetPath !== 0 ? targetPath : flow;
            })
            .map((moduleFlow) => {
                const { sourcePath, targetPath, sourceFlow, targetFlow } = moduleFlow;
                const sourceModule = sourceModules.find(m => m.id.toString() === sourcePath);
                const targetModule = targetModules.find(m => m.id.toString() === targetPath);
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
        const streamlineOffset = accumulatedOffsets.get(module.id) || 0;
        const offset = module.y + module.height + streamlineOffset;
        accumulatedOffsets.set(module.id, streamlineOffset - height);
        return { height, offset };
    }

    static moduleFlows(sourceNodes, targetNodes) {
        const nodesByName = new Map(targetNodes.map(node => [node.name, node]));

        return sourceNodes
            .filter(node => nodesByName.has(node.name))
            .reduce((moduleFlows, sourceNode) => {
                const targetNode = nodesByName.get(sourceNode.name);
                const found = moduleFlows.find(each =>
                    each.sourcePath === sourceNode.parentPath && each.targetPath === targetNode.parentPath);
                if (found) {
                    found.sourceFlow += sourceNode.flow;
                    found.targetFlow += targetNode.flow;
                } else {
                    moduleFlows.push({
                        sourcePath: sourceNode.parentPath,
                        targetPath: targetNode.parentPath,
                        sourceFlow: sourceNode.flow,
                        targetFlow: targetNode.flow,
                    });
                }
                return moduleFlows;
            }, []);
    }
}
