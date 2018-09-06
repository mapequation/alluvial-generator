import * as d3 from "d3";
import { streamlineHorizontal } from "../lib/streamline";


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
        const accumulatedSourceOffsets = d3.map();
        const accumulatedTargetOffsets = d3.map();
        const sourceModulesByPath = d3.map(sourceModules, m => m.path);
        const targetModulesByPath = d3.map(targetModules, m => m.path);

        return moduleFlows
            .filter(({ sourceFlow, targetFlow }) => (sourceFlow + targetFlow) / 2 > threshold)
            .filter(({ sourcePath, targetPath }) =>
                sourceModulesByPath.has(sourcePath) &&
                targetModulesByPath.has(targetPath))
            .map(moduleFlow => ({
                sourceModule: sourceModulesByPath.get(moduleFlow.sourcePath),
                targetModule: targetModulesByPath.get(moduleFlow.targetPath),
                ...moduleFlow,
            }))
            .sort((a, b) => {
                const bySourceFlow = b.sourceModule.flow - a.sourceModule.flow;
                const byTargetFlow = b.targetModule.flow - a.targetModule.flow;
                const byFlow = b.sourceFlow + b.targetFlow - a.sourceFlow + a.targetFlow;
                return Math.abs(bySourceFlow) > 1e-4 ? bySourceFlow
                    : Math.abs(byTargetFlow) > 1e-4 ? byTargetFlow
                        : byFlow;
            })
            .map((moduleFlow) => {
                const { sourceFlow, targetFlow, sourceModule, targetModule } = moduleFlow;
                const accumulatedSourceOffset = accumulatedSourceOffsets.get(sourceModule.path) || 0;
                const accumulatedTargetOffset = accumulatedTargetOffsets.get(targetModule.path) || 0;
                const streamlineSource = this._streamlineHeightOffset(sourceFlow, sourceModule, accumulatedSourceOffset);
                const streamlineTarget = this._streamlineHeightOffset(targetFlow, targetModule, accumulatedTargetOffset);
                accumulatedSourceOffsets.set(sourceModule.path, accumulatedSourceOffset - streamlineSource.height);
                accumulatedTargetOffsets.set(targetModule.path, accumulatedTargetOffset - streamlineTarget.height);
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

    _streamlineHeightOffset(flow, module, accumulatedOffset) {
        return {
            height: flow / module.flow * module.height,
            offset: module.y + module.height + accumulatedOffset,
        };
    }
}
