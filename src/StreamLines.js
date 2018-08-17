import { streamlineHorizontal } from "./streamline";


export default class StreamLines {
    constructor(sourceModules, targetModules, moduleFlows, threshold, width, xOffset) {
        this.sourceModules = sourceModules;
        this.targetModules = targetModules;
        this.moduleFlows = moduleFlows;
        this.threshold = threshold;
        this.width = width;
        this.xOffset = xOffset;
        this.streamlineGenerator = streamlineHorizontal();
    }

    path = (d) => this.streamlineGenerator(d.coordinates);

    get data() {
        return this._streamlinesWithCoordinates(this.sourceModules, this.targetModules, this.moduleFlows, this.threshold, this.width, this.xOffset);
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
                    ...moduleFlow,
                    coordinates: [
                        [xOffset, streamlineSource.offset],
                        [xOffset + width, streamlineTarget.offset],
                        [xOffset + width, streamlineTarget.offset - streamlineTarget.height],
                        [xOffset, streamlineSource.offset - streamlineSource.height],
                    ],
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
}
