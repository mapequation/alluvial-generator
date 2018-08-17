import StreamLines from "./StreamLines";
import Modules from "./Modules";


export default class Diagram {
    constructor(network, leftDiagram = null) {
        this.network = network;
        this.leftDiagram = leftDiagram;

        // TODO is this needed?
        this.rightDiagram = null;
        if (this.leftDiagram) {
            this.leftDiagram.rightDiagram = this;
        }
    }

    draw(element, numModules, threshold, maxTotalFlow, style) {
        const { streamlineWidth } = style;

        const largestModules = this.network.modules.slice(0, numModules);
        const modules = new Modules(largestModules, maxTotalFlow, style);

        if (this.leftDiagram) {
            const leftModules = this.leftDiagram.draw(element, numModules, threshold, maxTotalFlow, style);
            modules.moveToRightOf(leftModules);
            const moduleFlows = StreamLines.moduleFlows(this.leftDiagram.network.nodes, this.network.nodes);
            const streamlines = new StreamLines(leftModules.data, modules.data, moduleFlows, threshold, streamlineWidth, leftModules.rightSide);

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
