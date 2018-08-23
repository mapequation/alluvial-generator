import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

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

    componentDidUpdate(prevProps) {
        this.draw(prevProps);
    }

    draw(prevProps = this.props) {
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
            streamlines.push(new StreamLines(leftModules, rightModules, moduleFlows, streamlineThreshold, streamlineWidth));
        });

        /**
         * Modules
         */
        let modulesGroups = this.svg.selectAll(".modules")
            .data(modules);

        modulesGroups.exit().remove();

        modulesGroups = modulesGroups.enter().append("g")
            .merge(modulesGroups)
            .attr("class", "modules");

        const modulesUpdate = modulesGroups.selectAll(".module")
            .data(modules => modules.data, function key(d) {
                return d ? d.id : this.id;
            });

        const modulesEnter = modulesUpdate.enter().append("rect");

        modulesUpdate.exit()
            .transition(d3.transition().duration(300))
            .attr("height", 0)
            .attr("y", 0)
            .remove();

        const modulesToUpdate = modulesEnter.merge(modulesUpdate)
            .attr("class", "module");

        if (this.props.streamlineFraction !== prevProps.streamlineFraction) {
            modulesToUpdate
                .transition(d3.transition().duration(300))
                .attr("width", d => d.width)
                .attr("x", d => d.x)
                .attr("fill", "#CCCCBB")
                .attr("height", d => d.height)
                .attr("y", d => d.y);
        } else {
            modulesToUpdate
                .attr("width", d => d.width)
                .attr("x", d => d.x)
                .transition(d3.transition().duration(300))
                .attr("fill", "#CCCCBB")
                .attr("height", d => d.height)
                .attr("y", d => d.y);
        }

        /**
         * Streamlines
         */
        let streamlinesGroups = this.svg.selectAll(".streamlines")
            .data(streamlines);

        streamlinesGroups.exit().remove();

        streamlinesGroups = streamlinesGroups.enter().append("g")
            .merge(streamlinesGroups)
            .attr("class", "streamlines");

        const streamlinesUpdate = streamlinesGroups.selectAll(".streamline")
            .data(s => s.data, function key(d) {
                return d ? "" + d.sourcePath + ":" + d.targetPath : this.id;
            });

        const streamlinesEnter = streamlinesUpdate.enter().append("path");

        streamlinesUpdate.exit()
            .transition(d3.transition().duration(300))
            .attr("d", s => s.exitPath)
            .remove();

        streamlinesEnter
            .attr("d", s => s.enterPath)
            .attr("opacity", 0)
            .transition(d3.transition().duration(300).delay(100))
            .attr("opacity", 0.8)
            .attr("d", s => s.path);

        streamlinesEnter
            .merge(streamlinesUpdate)
            .attr("class", "streamline")
            .attr("fill", "#CCCCBB")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5);

        streamlinesUpdate
            .transition(d3.transition().duration(300))
            .attr("opacity", 0.8)
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
