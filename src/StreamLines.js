import { streamlineHorizontal } from "./streamline";


export default class StreamLines {
    constructor(sourceModules, targetModules) {
        this.sourceModules = sourceModules;
        this.targetModules = targetModules;
    }

    draw(element, flows, threshold, streamlineWidth, xOffset) {
        const streamlineCoordinates = this._streamlineCoordinates(this.sourceModules, this.targetModules, flows, threshold, streamlineWidth);
        const streamlineGenerator = streamlineHorizontal();

        element.append("g")
            .classed("streamlines", true)
            .attr("transform", `translate(${xOffset} 0)`)
            .selectAll(".link")
            .data(streamlineCoordinates)
            .enter()
            .append("path")
            .classed("streamline", true)
            .attr("d", streamlineGenerator);
    }

    _streamlineCoordinates(sourceModules, targetModules, flows, threshold, streamlineWidth) {
        const sourceOffsets = new Map();
        const targetOffsets = new Map();

        return flows
            .filter(({ sourceFlow, targetFlow }) => sourceFlow > threshold || targetFlow > threshold)
            .sort((a, b) => (b.sourceFlow + b.targetFlow) - (a.sourceFlow + a.targetFlow))
            .filter(({ sourcePath, targetPath }) =>
                sourceModules.some(m => m.id.toString() === sourcePath) && targetModules.some(m => m.id.toString() === targetPath))
            .map(({ sourcePath, targetPath, sourceFlow, targetFlow }) => {
                const sourceModule = sourceModules.find(m => m.id.toString() === sourcePath);
                const targetModule = targetModules.find(m => m.id.toString() === targetPath);
                const streamlineSource = this._streamlineHeightOffset(sourceFlow, sourceModule, sourceOffsets);
                const streamlineTarget = this._streamlineHeightOffset(targetFlow, targetModule, targetOffsets);
                return [
                    [0, streamlineSource.offset],
                    [streamlineWidth, streamlineTarget.offset],
                    [streamlineWidth, streamlineTarget.offset - streamlineTarget.height],
                    [0, streamlineSource.offset - streamlineSource.height],
                ];
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
