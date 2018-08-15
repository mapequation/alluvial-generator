import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import "./AlluvialDiagram.css";
import BarDiagram from "./BarDiagram";


export default class AlluvialDiagram extends React.Component {
    svg = d3.select(null);

    static defaultProps = {
        width: 1200,
        height: 500,
        barWidth: 200,
        totalHeight: 400,
        padding: 3,
        streamlineWidth: 200,
        numModules: 15,
        streamlineThreshold: 0.005,
    };

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        barWidth: PropTypes.number,
        totalHeight: PropTypes.number,
        padding: PropTypes.number,
        streamlineWidth: PropTypes.number,
        numModules: PropTypes.number,
        streamlineThreshold: PropTypes.number,
        networks: PropTypes.arrayOf(PropTypes.object),
    };

    componentDidMount() {
        this.svg = d3.select(this.node);
        this.draw();
    }

    componentDidUpdate() {
        this.svg.selectAll("*").remove();
        this.draw();
    }

    draw() {
        const { barWidth, totalHeight, padding, streamlineWidth, numModules, streamlineThreshold, networks } = this.props;

        const diagram = networks.reduce((child, network) =>
            new BarDiagram({ network, leftDiagram: child }), null);

        diagram.draw(this.svg, numModules, streamlineThreshold, { barWidth, totalHeight, padding, streamlineWidth });
    }

    render() {
        const { width, height } = this.props;
        return <svg style={{ background: "#efe", margin: "20px" }} width={width} height={height}
                    ref={node => this.node = node}/>;
    }
}
