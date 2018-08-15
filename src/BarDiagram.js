import StreamLines from "./StreamLines";


export default class BarDiagram {
    constructor(opts) {
        this.network = opts.network;
        this.leftDiagram = opts.leftDiagram || null;
        this._xOffset = 0;
    }

    draw(element, numModules, threshold, style) {
        const { barWidth, height, padding, streamlineWidth } = style;

        const largestModules = this.network.modules.slice(0, numModules);
        const modules = this._calculateModuleHeight(largestModules, height, padding);

        if (this.leftDiagram) {
            const leftModules = this.leftDiagram.draw(element, numModules, threshold, style);
            this._xOffset += this.leftDiagram._xOffset + barWidth + streamlineWidth;
            const streamlines = new StreamLines(leftModules, modules);
            const flows = StreamLines.calculateModuleFlows(this.leftDiagram.network.nodes, this.network.nodes);
            streamlines.draw(element, flows, threshold, streamlineWidth, this.leftDiagram._xOffset + barWidth);
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

    _calculateModuleHeight(modules, totalHeight, padding) {
        const totalFlow = modules.map(module => module.flow).reduce((tot, curr) => tot + curr);
        const totalPadding = padding * (modules.length - 1);

        let accumulatedHeight = totalHeight; // starting with largest module, so we subtract from this

        return modules.map(module => {
            const height = module.flow / totalFlow * (totalHeight - totalPadding);
            const y = accumulatedHeight - height;
            accumulatedHeight -= height + padding;
            return { height, y, ...module };
        });
    }

}
