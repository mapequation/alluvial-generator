import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import "./AlluvialDiagram.css";
import Modules from "./Modules";
import StreamLines from "./StreamLines";
import { pairwise } from "./helpers";


export default class AlluvialDiagram extends React.Component {
    svg = d3.select(null);

    static defaultProps = {
        width: 1200,
        height: 500,
        padding: 3,
        numModules: 15,
        streamlineFraction: 1,
        streamlineThreshold: 0.005,
    };

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        padding: PropTypes.number,
        numModules: PropTypes.number,
        streamlineFraction: PropTypes.number,
        streamlineThreshold: PropTypes.number,
        networks: PropTypes.arrayOf(PropTypes.object),
    };

    componentDidMount() {
        this.svg = d3.select(this.node);
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        const { width, height, padding, streamlineFraction, numModules, streamlineThreshold, networks } = this.props;

        const barWidth = AlluvialDiagram.barWidth(networks.length, width, streamlineFraction);
        const streamlineWidth = streamlineFraction * barWidth;
        const maxTotalFlow = AlluvialDiagram.maxTotalFlow(networks, numModules);
        const style = { barWidth, height, padding, streamlineWidth };

        const largestModules = networks.map(network => network.modules.slice(0, numModules));
        const modules = largestModules.map(m => new Modules(m, maxTotalFlow, style));
        const streamlines = [];

        pairwise(modules, (left, right) => right.moveToRightOf(left));

        pairwise(modules, (leftModules, rightModules, i) => {
            const moduleFlows = StreamLines.moduleFlows(networks[i].nodes, networks[i + 1].nodes);
            streamlines.push(new StreamLines(leftModules.data, rightModules.data, moduleFlows, streamlineThreshold, streamlineWidth, leftModules.rightSide));
        });

        let modulesGroups = this.svg.selectAll(".modules")
            .data(modules);

        modulesGroups.exit().remove();

        modulesGroups = modulesGroups.enter().append("g")
            .merge(modulesGroups)
            .classed("modules", true);

        let modulesElements = modulesGroups.selectAll(".module")
            .data(modules => modules.data, function byKey(d) {
                return d ? d.id : this.id;
            });

        modulesElements.exit().remove();

        modulesElements = modulesElements.enter().append("rect")
            .merge(modulesElements)
            .classed("module", true)
            .attr("width", d => d.width)
            .attr("x", d => d.x)
            .transition()
            .attr("height", d => d.height)
            .attr("y", d => d.y);

        let streamlinesGroups = this.svg.selectAll(".streamlines")
            .data(streamlines);

        streamlinesGroups.exit().remove();

        streamlinesGroups = streamlinesGroups.enter().append("g")
            .merge(streamlinesGroups)
            .classed("streamlines", true);

        let streamlinesElements = streamlinesGroups.selectAll(".streamline")
            .data(s => s.data);

        streamlinesElements.exit().remove();

        streamlinesElements = streamlinesElements.enter().append("path")
            .merge(streamlinesElements)
            .classed("streamline", true)
            .transition()
            .attr("d", s => s.path);
    }

    static maxTotalFlow(networks, numModules) {
        return networks
            .map(network => network.modules.slice(0, numModules)
                .map(module => module.flow)
                .reduce((tot, curr) => tot + curr, 0))
            .reduce((max, curr) => Math.max(max, curr), -Infinity);
    }

    static barWidth(numModules, totalWidth, streamlineFraction) {
        const numStreamlines = numModules - 1;
        return totalWidth / (numModules + numStreamlines * streamlineFraction);
    }

    render() {
        const { width, height } = this.props;
        return <svg style={{ margin: "20px" }} width={width} height={height}
                    ref={node => this.node = node}/>;
    }
}
