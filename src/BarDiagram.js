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
            const moduleFlows = calculateModuleFlows(this.leftDiagram.network.nodes, this.network.nodes);
            const streamlines = new StreamLines(leftModules, modules, moduleFlows);
            streamlines.draw(element, threshold, streamlineWidth, this.leftDiagram._xOffset + barWidth);
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

    _maxTotalFlow(numModules) {
        const modules = this.network.modules.slice(0, numModules);
        const totalFlow = modules.map(module => module.flow).reduce((tot, curr) => tot + curr, 0);
        return this.leftDiagram ? Math.max(this.leftDiagram._maxTotalFlow(numModules), totalFlow) : totalFlow;
    }

    _calculateModuleHeight(modules, totalHeight, padding) {
        const totalFlow = this._maxTotalFlow(modules.length);
        const totalPadding = padding * (modules.length - 1);

        let accumulatedHeight = totalHeight; // starting from the bottom, so we subtract from this

        return modules.map(module => {
            const height = module.flow / totalFlow * (totalHeight - totalPadding);
            const y = accumulatedHeight - height;
            accumulatedHeight -= height + padding;
            return { height, y, ...module };
        });
    }

}

function calculateModuleFlows(sourceNodes, targetNodes) {
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
