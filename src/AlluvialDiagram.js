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
        this.svg.selectAll("*").remove();
        this.draw();
    }

    draw() {
        const { width, height, padding, streamlineFraction, numModules, streamlineThreshold, networks } = this.props;

        const N = networks.length;
        const barWidth = width / (N + (N - 1) * streamlineFraction);
        const streamlineWidth = streamlineFraction * barWidth;
        const maxTotalFlow = networks.map(network =>
            network.modules.slice(0, numModules).map(module => module.flow).reduce((tot, curr) => tot + curr, 0)
        ).reduce((max, curr) => Math.max(max, curr), -Infinity);

        const diagram = networks.reduce((child, network) =>
            new BarDiagram({ network, leftDiagram: child }), null);

        diagram.draw(this.svg, numModules, streamlineThreshold, maxTotalFlow, { barWidth, height, padding, streamlineWidth });
    }

    render() {
        const { width, height } = this.props;
        return <svg style={{ margin: "20px" }} width={width} height={height}
                    ref={node => this.node = node}/>;
    }
}
