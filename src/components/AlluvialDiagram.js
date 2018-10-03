import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import TreePath from "../lib/treepath";
import { COORDINATES } from "../workers/actions";
import { createWorker, workerPromise } from "../workers/worker-utils";
import Alluvial from "../alluvial/AlluvialDiagram";


export default class AlluvialDiagram extends React.Component {
    svg = d3.select(null);
    worker = workerPromise(createWorker());

    static defaultProps = {
        width: 1200,
        height: 600,
        padding: 3,
        numModules: 15,
        streamlineFraction: 1,
        streamlineThreshold: 0.005,
        parentModule: "root",
        duration: 200,
    };

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        padding: PropTypes.number,
        numModules: PropTypes.number,
        streamlineFraction: PropTypes.number,
        streamlineThreshold: PropTypes.number,
        networks: PropTypes.arrayOf(PropTypes.object),
        moduleFlows: PropTypes.arrayOf(PropTypes.object),
        parentModule: PropTypes.string,
        duration: PropTypes.number,
    };

    componentDidMount() {
        this.svg = d3.select(this.node);
        this.draw();
    }

    componentDidUpdate(prevProps) {
        this.draw(prevProps);
    }

    propsChanged(props, prevProps) {
        return {
            networkRemoved: props.networks.length < prevProps.networks.length,
            networkAdded: props.networks.length > prevProps.networks.length,
            widthChanged: props.width !== prevProps.width,
            heightChanged: props.height !== prevProps.height,
            streamlineFractionChanged: props.streamlineFraction !== prevProps.streamlineFraction,
            parentModuleChanged: props.parentModule !== prevProps.parentModule,
        };
    }

    async draw(prevProps = this.props) {
        const { duration } = this.props;

        const alluvial = new Alluvial(this.props.networks);

        const {
            networkRemoved,
            networkAdded,
            widthChanged,
            streamlineFractionChanged,
            parentModuleChanged,
        } = this.propsChanged(this.props, prevProps);

        const { modules, streamlines } = await this.worker({
            type: COORDINATES,
            props: {
                width: this.props.width,
                height: this.props.height,
                padding: this.props.padding,
                streamlineFraction: this.props.streamlineFraction,
                numModules: this.props.numModules,
                streamlineThreshold: this.props.streamlineThreshold,
                networks: this.props.networks,
                parentModule: this.props.parentModule,
                moduleFlows: this.props.moduleFlows,
            },
        });

        const t = d3.transition().duration(duration);
        const delay = duration * 0.75;
        const g = this.svg.select(".alluvial-diagram");

        /**
         * Modules
         */
        const moduleWidthX = selection => selection.attr("width", d => d.width).attr("x", d => d.x);
        const moduleHeightY = selection => selection.attr("height", d => d.height).attr("y", d => d.y);
        const moduleUpdateTransition = selection => selection.call(moduleWidthX).call(moduleHeightY);
        const moduleExitTransition = selection => selection.attr("height", 0).attr("y", 0);

        let modulesGroups = g.selectAll(".modules")
            .data(modules);

        modulesGroups.exit()
            .selectAll(".module")
            .transition(t)
            .call(moduleExitTransition);

        modulesGroups.exit()
            .transition(t)
            .remove();

        modulesGroups = modulesGroups.enter().append("g")
            .merge(modulesGroups)
            .attr("class", "modules");

        const modulesUpdate = modulesGroups.selectAll(".module")
            .data(d => d, function key(d) {
                return d ? d.path : this.id;
            });

        const modulesEnter = modulesUpdate.enter().append("rect")
            .attr("class", "module")
            .attr("fill", "#ccccbb")
            .attr("opacity", 1)
            .on("click", d => console.log(d));

        modulesUpdate.exit()
            .transition(t)
            .call(moduleExitTransition)
            .remove();

        const modulesEnterUpdate = modulesEnter.merge(modulesUpdate);

        if (streamlineFractionChanged || widthChanged) {
            modulesEnterUpdate
                .transition(t)
                .call(moduleUpdateTransition);
        } else if (networkRemoved) {
            modulesUpdate
                .transition(t).delay(delay) // Wait for removed modules
                .call(moduleUpdateTransition);
        } else if (networkAdded) {
            modulesUpdate
                .transition(t)
                .call(moduleUpdateTransition);
            modulesEnter
                .call(moduleWidthX)
                .transition(t).delay(delay) // Wait for existing modules
                .call(moduleHeightY);
        } else if (parentModuleChanged) {
            modulesEnter
                .call(moduleWidthX)
                .transition(t)
                .delay(delay)
                .call(moduleHeightY);
        } else {
            modulesEnterUpdate
                .call(moduleWidthX)
                .transition(t)
                .call(moduleHeightY);
        }

        /**
         * Streamlines
         */
        const streamlineEnterOpacityPath = selection => selection.attr("opacity", 0).attr("d", d => d.svgEnterPath);
        const streamlineOpacityPath = selection => selection.attr("opacity", 0.8).attr("d", d => d.svgPath);

        let streamlinesGroups = g.selectAll(".streamlines")
            .data(streamlines);

        streamlinesGroups.exit()
            .selectAll(".streamline")
            .transition(t)
            .attr("d", d => d.svgExitPath);

        streamlinesGroups.exit()
            .transition(t)
            .remove();

        streamlinesGroups = streamlinesGroups.enter().append("g")
            .merge(streamlinesGroups)
            .attr("class", "streamlines");

        const streamlinesUpdate = streamlinesGroups.selectAll(".streamline")
            .data(d => d, function key(d) {
                return d ? TreePath.join(d.sourcePath, d.targetPath) : this.id;
            });

        const streamlinesEnter = streamlinesUpdate.enter().append("path")
            .attr("class", "streamline")
            .attr("fill", "#ccccbb")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("click", d => console.log(d));

        streamlinesUpdate.exit()
            .transition(t)
            .attr("d", d => d.svgExitPath)
            .remove();

        const streamlineDelay = delay => (d, index, elements) => {
            const timeBudget = duration * 0.5;
            const timePerElement = timeBudget / elements.length;
            return delay + timePerElement * index;
        };

        if (networkRemoved) {
            streamlinesUpdate
                .transition(t).delay(delay) // Wait for removed modules
                .call(streamlineOpacityPath);
        } else if (parentModuleChanged) {
            streamlinesEnter
                .call(streamlineEnterOpacityPath)
                .transition(t).delay(streamlineDelay(2 * delay))
                .call(streamlineOpacityPath);
        } else {
            streamlinesUpdate
                .transition(t)
                .call(streamlineOpacityPath);
            streamlinesEnter
                .call(streamlineEnterOpacityPath)
                .transition(t).delay(streamlineDelay(delay))
                .call(streamlineOpacityPath);
        }
    }

    render() {
        return <svg ref={node => this.node = node}>
            <g className="alluvial-diagram"/>
        </svg>;
    }
}
