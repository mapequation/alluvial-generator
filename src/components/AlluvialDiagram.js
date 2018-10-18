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
    streamlineFraction: 1,
    streamlineThreshold: 0.005,
    duration: 200
  };

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    streamlineFraction: PropTypes.number,
    streamlineThreshold: PropTypes.number,
    networks: PropTypes.arrayOf(PropTypes.object),
    duration: PropTypes.number
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

  async draw(prevProps = this.props) {
    const {
      width,
      height,
      streamlineFraction,
      duration,
      networks
    } = this.props;

    if (prevProps.networks.length !== networks.length) {
      this.diagram = new Diagram(networks);
    }

    this.diagram.calcLayout(width, height, streamlineFraction);
    const alluvialRoot = this.diagram.asObject();

    console.log(this.diagram);

    const t = d3.transition().duration(duration);
    const delay = 0.5 * duration;

    this.svg
      .transition(t)
      .attr("width", alluvialRoot.width)
      .attr("height", alluvialRoot.height);

    const g = this.svg.select(".alluvial-diagram");

    const onClick = d => {
      console.log(d);
    };

    const onDoubleClick = d => {
      this.diagram.doubleClick(d);
      this.draw();
    };

    let roots = g
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, function key(d) {
        return d ? d.id : this.id;
      });

    roots.exit().remove();

    roots = roots
      .enter()
      .append("g")
      .merge(roots)
      .attr("class", "networkRoot");

    const streamlines = roots
      .selectAll(".streamline")
      .data(d => d.links, function key(d) {
        return d ? d.leftId : this.id;
      });

    streamlines
      .exit()
      .transition(t)
      .attr("d", d => this.streamlineGenerator(d.transitionPath))
      .attr("opacity", 0)
      .remove();

    const staggeredDelay = delay => (d, index, elements) => {
      const timeBudget = duration * 0.5;
      const timePerElement = timeBudget / elements.length;
      return delay + timePerElement * index;
    };

    streamlines.transition(t).attr("d", this.streamlineGenerator);

    streamlines
      .enter()
      .filter(d => d.h0 + d.h1 > 3)
      .append("path")
      .attr("class", "streamline")
      .on("click", onClick)
      .attr("fill", "#B6B69F")
      .attr("stroke", "white")
      .attr("opacity", 0)
      .attr("d", d => this.streamlineGenerator(d.transitionPath))
      .transition(t)
      .attr("opacity", 0.5)
      .delay(staggeredDelay(1.5 * delay))
      .attr("d", this.streamlineGenerator);

    let modules = roots
      .selectAll(".module")
      .data(d => d.children, function key(d) {
        return d ? d.id : this.id;
      });

    const groupExit = modules.exit().selectAll(".group");

    groupExit
      .selectAll("rect")
      .transition(t)
      .delay(delay)
      .attr("y", d => d.y - d.height * 0.1)
      .attr("height", d => d.height * 1.2)
      .attr("opacity", 0);

    groupExit
      .selectAll("text")
      .transition(t)
      .delay(delay)
      .attr("opacity", 0)
      .attr("font-size", 0);

    modules
      .exit()
      .transition(t)
      .delay(delay)
      .remove();

    modules = modules
      .enter()
      .append("g")
      .merge(modules)
      .attr("class", "module")
      .on("click", onClick)
      .on("dblclick", onDoubleClick);

    const setWidthX = d => d.attr("x", d => d.x).attr("width", d => d.width);
    const setHeightY = d => d.attr("y", d => d.y).attr("height", d => d.height);

    const groups = modules
      .selectAll(".group")
      .data(d => d.children, function key(d) {
        return d ? d.id : this.id;
      });

    groups.exit().remove();

    groups
      .select("rect")
      .transition(t)
      .call(setHeightY)
      .call(setWidthX);

    groups
      .select("text")
      .transition(t)
      .attr("x", d => d.x + d.width / 2)
      .attr("y", d => d.y + d.height / 2);

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "group");

    groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .attr("fill", "#B6B69F")
      .attr("opacity", 0)
      .transition(t)
      .delay(delay)
      .attr("opacity", 1);

    groupsEnter
      .filter(d => d.flow > 1e-3)
      .append("text")
      .text(d => d.id)
      .attr("x", d => d.x + d.width / 2)
      .attr("y", d => d.y + d.height / 2)
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("opacity", 1)
      .attr("font-size", 0)
      .transition(t)
      .delay(delay)
      .attr("font-size", d => d.flow * 5 + 8);
  }

  render() {
    return (
      <svg ref={node => (this.node = node)} xmlns={d3.namespaces.svg}>
        <g className="alluvial-diagram" />
      </svg>
    );
  }
}
