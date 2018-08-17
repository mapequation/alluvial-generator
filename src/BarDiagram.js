import StreamLines from "./StreamLines";
import Modules from "./Modules";


export default class BarDiagram {
    constructor(opts) {
        this.network = opts.network;
        this.leftDiagram = opts.leftDiagram || null;
    }

    draw(element, numModules, threshold, maxTotalFlow, style) {
        const { barWidth, streamlineWidth } = style;

        const modules = new Modules(this.network, numModules, maxTotalFlow, style);

        if (this.leftDiagram) {
            const leftModules = this.leftDiagram.draw(element, numModules, threshold, maxTotalFlow, style);
            modules.offsetOf(leftModules);
            const moduleFlows = calculateModuleFlows(this.leftDiagram.network.nodes, this.network.nodes);
            const streamlines = new StreamLines(leftModules.data, modules.data, moduleFlows, threshold, streamlineWidth, leftModules.xOffset + barWidth);

            element.append("g")
                .classed("streamlines", true)
                .selectAll(".streamline")
                .data(streamlines.data)
                .enter()
                .append("path")
                .classed("streamline", true)
                .attr("d", streamlines.path);
        }

        element.append("g")
            .classed("modules", true)
            .selectAll(".module")
            .data(modules.data)
            .enter()
            .append("rect")
            .classed("module", true)
            .attr("width", modules.width)
            .attr("height", modules.height)
            .attr("x", modules.x)
            .attr("y", modules.y);

        return modules;
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
