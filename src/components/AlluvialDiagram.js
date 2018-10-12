import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Diagram from "../alluvial/Diagram";
import { streamlineHorizontal } from "../lib/streamline";


export default class AlluvialDiagram extends React.Component {
    svg = d3.select(null);
    streamlineGenerator = streamlineHorizontal();

    static defaultProps = {
        width: 1200,
        height: 600,
        padding: 3,
        streamlineFraction: 1,
        streamlineThreshold: 0.005,
        duration: 200,
    };

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        padding: PropTypes.number,
        streamlineFraction: PropTypes.number,
        streamlineThreshold: PropTypes.number,
        networks: PropTypes.arrayOf(PropTypes.object),
        duration: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.diagram = new Diagram(this.props.networks);
    }

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
        };
    }

    async draw(prevProps = this.props) {
        const { width, height, padding, streamlineFraction } = this.props;

        this.diagram.calcLayout(width, height, padding, streamlineFraction);
        const tree = this.diagram.asObject();

        console.log(this.diagram);
        console.log(tree);

        this.svg
            .attr("width", tree.layout.width)
            .attr("height", tree.layout.height);

        const g = this.svg.select(".alluvial-diagram");

        const onClick = (d) => {
            console.log(d);
        };

        const onDoubleClick = (d) => {
            this.diagram.doubleClick(d);
            g.selectAll("*").remove();
            this.draw();
        };

        const onClickStreamline = (d) => {
            console.log(d.leftId, d);
        };

        const roots = g.selectAll(".networkRoot")
            .data(tree.children);

        const rootsEnter = roots.enter()
            .append("g")
            .attr("class", "networkRoot");

        const streamlines = rootsEnter.selectAll(".streamline")
            .data(d => d.links);

        streamlines.enter()
            .filter(d => d.h0 + d.h1 > 3)
            .append("path")
            .attr("class", "streamline")
            .attr("opacity", 0.5)
            .attr("fill", "#B6B69F")
            .attr("stroke", "white")
            .attr("d", this.streamlineGenerator)
            .on("click", onClickStreamline);

        const modules = rootsEnter.selectAll(".module")
            .data(d => d.children);

        const modulesEnter = modules.enter()
            .append("g")
            .attr("class", "module")
            .on("click", onClick)
            .on("dblclick", onDoubleClick);

        const groups = modulesEnter.selectAll(".group")
            .data(d => d.children);

        const groupsEnter = groups.enter()
            .append("g")
            .attr("class", "group");

        groupsEnter.append("rect")
            .attr("x", d => d.layout.x)
            .attr("y", d => d.layout.y)
            .attr("width", d => d.layout.width)
            .attr("height", d => d.layout.height)
            .attr("fill", "#B6B69F")
            .attr("stroke-location", "outside");

        const branch = groupsEnter.selectAll(".branch")
            .data(d => d.children);

        const branchEnter = branch.enter()
            .append("g")
            .attr("class", d => `branch ${d.side}`);

        const streamlineNode = branchEnter.selectAll(".streamlineNode")
            .data(d => d.children);

        const streamlineNodeEnter = streamlineNode.enter()
            .append("g")
            .attr("class", "streamlineNode");

        streamlineNodeEnter.append("rect")
            .attr("x", d => d.layout.x)
            .attr("y", d => d.layout.y)
            .attr("width", d => d.layout.width)
            .attr("height", d => d.layout.height)
            .attr("fill-opacity", 0);
    }

    render() {
        return <svg ref={node => this.node = node}>
            <g className="alluvial-diagram"/>
        </svg>;
    }
}
