// @flow
import * as d3 from "d3";
import { streamlineHorizontal } from "../lib/streamline";
import Modules from "./Modules";
import type { ModuleFlow } from "./accumulate-module-flow";


export type StreamLineCoordinates = ModuleFlow & {
    svgEnterPath: string,
    svgPath: string,
    svgExitPath: string,
};

export default class StreamLines {
    sourceModules: Modules;
    targetModules: Modules;
    moduleFlows: ModuleFlow[];
    threshold: number;
    width: number;
    xOffset: number;
    streamlineGenerator = streamlineHorizontal();

    constructor(sourceModules: Modules, targetModules: Modules, moduleFlows: ModuleFlow[], threshold: number, width: number) {
        this.sourceModules = sourceModules;
        this.targetModules = targetModules;
        this.moduleFlows = moduleFlows;
        this.threshold = threshold;
        this.width = width;
        this.xOffset = sourceModules.rightSide;
    }

    get data(): StreamLineCoordinates[] {
        const width = this.width;
        const xOffset = this.xOffset;
        const accumulatedSourceOffsets = d3.map();
        const accumulatedTargetOffsets = d3.map();
        const sourceModulesByPath = d3.map(this.sourceModules.data, m => m.path);
        const targetModulesByPath = d3.map(this.targetModules.data, m => m.path);

        return this.moduleFlows
            .filter(({ sourceFlow, targetFlow }) => (sourceFlow + targetFlow) / 2 > this.threshold)
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
                const streamlineSourceHeight = sourceFlow / sourceModule.flow * sourceModule.height;
                const streamlineTargetHeight = targetFlow / targetModule.flow * targetModule.height;
                const streamlineSourceY = sourceModule.y + sourceModule.height + accumulatedSourceOffset;
                const streamlineTargetY = targetModule.y + targetModule.height + accumulatedTargetOffset;
                accumulatedSourceOffsets.set(sourceModule.path, accumulatedSourceOffset - streamlineSourceHeight);
                accumulatedTargetOffsets.set(targetModule.path, accumulatedTargetOffset - streamlineTargetHeight);
                return {
                    svgEnterPath: this.streamlineGenerator([
                        [xOffset + width / 2, (streamlineSourceY + streamlineTargetY) / 2],
                        [xOffset + width / 2, (streamlineSourceY + streamlineTargetY) / 2],
                        [xOffset + width / 2, (streamlineSourceY + streamlineTargetY) / 2 - streamlineTargetHeight],
                        [xOffset + width / 2, (streamlineSourceY + streamlineTargetY) / 2 - streamlineTargetHeight],
                    ]),
                    svgPath: this.streamlineGenerator([
                        [xOffset, streamlineSourceY],
                        [xOffset + width, streamlineTargetY],
                        [xOffset + width, streamlineTargetY - streamlineTargetHeight],
                        [xOffset, streamlineSourceY - streamlineSourceHeight],
                    ]),
                    svgExitPath: this.streamlineGenerator([
                        [xOffset, 0],
                        [xOffset + width, 0],
                        [xOffset + width, 0],
                        [xOffset, 0],
                    ]),
                    ...moduleFlow,
                };
            });
    }
}
