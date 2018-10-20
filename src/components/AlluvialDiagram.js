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
    streamlineFraction: 2,
    duration: 200
  };

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    streamlineFraction: PropTypes.number,
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

    const alluvialDiagram = this.svg.select(".alluvialDiagram");

    const onClick = d => console.log(d);

    const onDoubleClick = d => {
      this.diagram.doubleClick(d);
      this.draw();
    };

    function key(d) {
      return d ? d.id : this.id;
    }

    const setWidthX = d => d.attr("x", d => d.x).attr("width", d => d.width);
    const setHeightY = d => d.attr("y", d => d.y).attr("height", d => d.height);
    const setTextPosition = d =>
      d.attr("x", d => d.x + d.width / 2).attr("y", d => d.y + d.height / 2);
    const setOpacity = (d, opacity) => d.attr("opacity", opacity);
    const makeTransparent = d => setOpacity(d, 0);
    const makeOpaque = d => setOpacity(d, 1);
    const setStreamlinePath = (d, path = "path") =>
      d.attr("d", d => this.streamlineGenerator(d[path]));
    const setStreamlineTransitionPath = d =>
      setStreamlinePath(d, "transitionPath");

    let networkRoots = alluvialDiagram
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, key);

    networkRoots.exit().remove();

    networkRoots = networkRoots
      .enter()
      .append("g")
      .attr("class", "networkRoot")
      .merge(networkRoots);

    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(d => d.links, key);

    const streamlineDelay = (delay = 0) => (d, index, elements) => {
      const timeBudget = duration * 0.5;
      const timePerElement = timeBudget / elements.length;
      return delay + timePerElement * index;
    };

    streamlines
      .exit()
      .transition(t)
      .delay(streamlineDelay())
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .remove();

    streamlines.transition(t).call(setStreamlinePath);

    streamlines
      .enter()
      .filter(d => d.avgHeight > 2)
      .append("path")
      .attr("class", "streamline")
      .on("click", onClick)
      .attr("fill", "#B6B69F")
      .attr("stroke", "white")
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .transition(t)
      .delay(streamlineDelay(1.5 * delay))
      .call(setOpacity, 0.5)
      .call(setStreamlinePath);

    let modules = networkRoots.selectAll(".module").data(d => d.children, key);

    const groupExit = modules.exit().selectAll(".group");

    groupExit
      .selectAll("text")
      .transition(t)
      .call(makeTransparent)
      .attr("font-size", 0);

    groupExit
      .selectAll("rect")
      .transition(t)
      .delay(delay)
      .attr("y", d => d.y - d.height * 0.1)
      .attr("height", d => d.height * 1.2)
      .call(makeTransparent);

    modules
      .exit()
      .transition(t)
      .delay(delay)
      .remove();

    modules = modules
      .enter()
      .append("g")
      .attr("class", "module")
      .on("click", onClick)
      .on("dblclick", onDoubleClick)
      .merge(modules);

    const groups = modules.selectAll(".group").data(d => d.children, key);

    groups.exit().remove();

    groups
      .select("rect")
      .transition(t)
      .call(setHeightY)
      .call(setWidthX);

    groups
      .select("text")
      .transition(t)
      .call(setTextPosition);

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "group");

    groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .call(makeTransparent)
      .attr("fill", "#B6B69F")
      .transition(t)
      .delay(delay)
      .call(makeOpaque);

    groupsEnter
      .filter(d => d.flow > 1e-3)
      .append("text")
      .text(d => d.id)
      .call(setTextPosition)
      .call(makeOpaque)
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 0)
      .transition(t)
      .delay(delay)
      .attr("font-size", d => d.flow * 5 + 8);
  }

  render() {
    return (
      <svg ref={node => (this.node = node)} xmlns={d3.namespaces.svg}>
        <g className="alluvialDiagram" />
      </svg>
    );
  }
}
