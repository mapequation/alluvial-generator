import { streamlineHorizontal } from "./streamline";


const calculateModuleFlows = (sourceNodes, targetNodes) => {
    const nodesByName = new Map(targetNodes.map(node => [node.name, node]));

    return sourceNodes
        .filter(node => nodesByName.has(node.name))
        .reduce((acc, node) => {
            const other = nodesByName.get(node.name);
            const sourcePath = node.parentPath;
            const targetPath = other.parentPath;
            const found = acc.find(each => each.sourcePath === sourcePath && each.targetPath === targetPath);
            if (found) {
                found.flow += node.flow;
            } else {
                acc.push({ sourcePath, targetPath, flow: node.flow });
            }
            return acc;
        }, []);
};

const calculateModuleHeight = (modules, totalHeight, padding) => {
    const totalFlow = modules.map(module => module.flow).reduce((tot, curr) => tot + curr);
    const totalPadding = padding * (modules.length - 1);

    let accumulatedHeight = totalHeight; // starting with largest module, so we subtract from this

    return modules.map(module => {
        const height = module.flow / totalFlow * (totalHeight - totalPadding);
        const y = accumulatedHeight - height;
        accumulatedHeight -= height + padding;
        return { height, y, ...module };
    });
};

export default class BarDiagram {
    constructor(opts) {
        this.network = opts.network;
        this.leftDiagram = opts.leftDiagram || null;
        this._xOffset = 0;
    }

    draw(element, numModules, threshold, style) {
        const { barWidth, totalHeight, padding, streamlineWidth } = style;

        const largestModules = this.network.modules.slice(0, numModules);
        const modules = calculateModuleHeight(largestModules, totalHeight, padding);

        if (this.leftDiagram) {
            const leftModules = this.leftDiagram.draw(element, numModules, threshold, style);
            this._xOffset += this.leftDiagram._xOffset + barWidth + streamlineWidth;
            this._drawStreamlines(element, leftModules, modules, threshold, streamlineWidth, barWidth);
        }

        element.append("g")
            .classed("bars", true)
            .attr("transform", `translate(${this._xOffset} 0)`)
            .selectAll(".bar")
            .data(modules)
            .enter()
            .append("rect")
            .classed("bar", true)
            .attr("width", barWidth)
            .attr("height", d => d.height)
            .attr("y", d => d.y);

        return modules;
    }

    _drawStreamlines(element, sourceModules, targetModules, threshold, streamlineWidth, barWidth) {
        const streamlineCoordinates = this._streamlineCoordinates(sourceModules, targetModules, threshold, streamlineWidth);
        const streamlineGenerator = streamlineHorizontal();

        element.append("g")
            .classed("streamlines", true)
            .attr("transform", `translate(${this.leftDiagram._xOffset + barWidth} 0)`)
            .selectAll(".link")
            .data(streamlineCoordinates)
            .enter()
            .append("path")
            .classed("streamline", true)
            .attr("d", streamlineGenerator);
    }

    _streamlineCoordinates(sourceModules, targetModules, threshold, streamlineWidth) {
        const streamlineCoordinates = [];

        const sourceOffsets = new Map();
        const targetOffsets = new Map();

        calculateModuleFlows(this.leftDiagram.network.nodes, this.network.nodes)
            .filter(f => f.flow > threshold)
            .sort((a, b) => b.flow - a.flow)
            .forEach(({ sourcePath, targetPath, flow }) => {
                const source = sourceModules.find(m => m.id.toString() === sourcePath);
                const target = targetModules.find(m => m.id.toString() === targetPath);

                if (source && target) {
                    const sourceStreamlineOffset = sourceOffsets.get(sourcePath) || 0;
                    const targetStreamlineOffset = targetOffsets.get(targetPath) || 0;
                    const sourceStreamlineHeight = flow / source.flow * source.height;
                    const targetStreamlineHeight = flow / target.flow * target.height;
                    const sourceOffset = source.y + source.height + sourceStreamlineOffset;
                    const targetOffset = target.y + target.height + targetStreamlineOffset;
                    streamlineCoordinates.push([
                        [0, sourceOffset], [streamlineWidth, targetOffset],
                        [streamlineWidth, targetOffset - targetStreamlineHeight], [0, sourceOffset - sourceStreamlineHeight],
                    ]);
                    sourceOffsets.set(sourcePath, sourceStreamlineOffset - sourceStreamlineHeight);
                    targetOffsets.set(targetPath, targetStreamlineOffset - targetStreamlineHeight);
                }
            });

        return streamlineCoordinates;
    }
}
