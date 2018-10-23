import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Diagram from "../alluvial/Diagram";
import LinearGradients from "./LinearGradients";
import { streamlineHorizontal } from "../lib/streamline";

export default class AlluvialDiagram extends React.Component {
  svg = d3.select(null);
  streamlineGenerator = streamlineHorizontal();
  diagram = null;

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

    this.numColors = 5;
    this.highlightColors = d3
      .ticks(0, 1, this.numColors)
      .map(d3.interpolateRainbow);
    this.defaultColor = "#b6b69f";
  }

  componentDidMount() {
    this.svg = d3.select(this.node);

    this.svg
      .select("defs")
      .selectAll("filter")
      .data([1, 2, 3, 4, 5])
      .enter()
      .append("filter")
      .attr("id", d => `shadow${d}`)
      .attr("x", "-50%")
      .attr("y", "-100%")
      .attr("width", "200%")
      .attr("height", "400%")
      .append("feDropShadow");

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

    const networkAdded = networks.length > prevProps.networks.length;
    const networkRemoved = networks.length < prevProps.networks.length;

    if (!this.diagram) {
      this.diagram = new Diagram(
        networks.map(({ data }) => ({ nodes: data.nodes, id: data.meta.id }))
      );
    }

    if (networkAdded) {
      for (let { data } of networks) {
        if (!this.diagram.hasNetwork(data.meta.id)) {
          this.diagram.addNetwork({ nodes: data.nodes, id: data.meta.id });
        }
      }
    } else if (networkRemoved) {
      const removed = prevProps.networks.filter(n => networks.indexOf(n) < 0);
      for (let { data } of removed) {
        if (this.diagram.hasNetwork(data.meta.id)) {
          this.diagram.removeNetwork(data.meta.id);
        }
      }
    }

    this.diagram.calcLayout(width - 50, height - 50, streamlineFraction);
    const alluvialRoot = this.diagram.asObject();

    console.log(this.diagram);

    const t = d3.transition().duration(duration);
    const delay = 0.5 * duration;

    if (networkRemoved) {
      this.svg
        .transition(t)
        .delay(duration)
        .attr("width", width)
        .attr("height", height);
    } else {
      this.svg
        .transition(t)
        .attr("width", width)
        .attr("height", height);
    }

    const alluvialDiagram = this.svg
      .select(".alluvialDiagram")
      .attr("transform", "translate(25 25)");

    const onClick = d => console.log(d);

    const onDoubleClick = d => {
      this.diagram.doubleClick(d, d3.event.shiftKey);
      this.draw();
    };

    function key(d) {
      return d ? d.id : this.id;
    }

    const setWidthX = d => d.attr("x", d => d.x).attr("width", d => d.width);
    const setHeightY = d => d.attr("y", d => d.y).attr("height", d => d.height);
    const setTextPosition = d =>
      d.attr("x", d => d.x + d.width / 2).attr("y", d => d.y + d.height / 2);
    const setTextFontSize = d => d.attr("font-size", d => d.flow * 7 + 5);
    const setOpacity = (d, opacity) => d.attr("opacity", opacity);
    const makeTransparent = d => setOpacity(d, 0);
    const makeOpaque = d => setOpacity(d, 1);
    const setStreamlinePath = (d, path = "path") =>
      d.attr("d", d => this.streamlineGenerator(d[path]));
    const setStreamlineTransitionPath = d =>
      setStreamlinePath(d, "transitionPath");
    const setStreamlineNetworkTransitionPath = d =>
      setStreamlinePath(d, "networkTransitionPath");

    const setShadow = d =>
      d.style("filter", d => `url(#shadow${Math.min(d.moduleLevel, 5)})`);

    const maxModuleLevel = Math.min(alluvialRoot.maxModuleLevel, 5);
    for (let level = 1; level <= maxModuleLevel; level++) {
      const x = maxModuleLevel + 1 - level;

      this.svg
        .select(`#shadow${level}`)
        .select("feDropShadow")
        .transition(t)
        .attr("dx", 0.5 * x)
        .attr("dy", 0.5 * x)
        .attr("stdDeviation", 0.5 * x)
        .attr("flood-opacity", -0.05 * x + 0.95);
    }

    const textNetworkExitTransition = d =>
      d
        .selectAll("text")
        .transition(t)
        .delay(0)
        .call(makeTransparent)
        .attr("y", 0)
        .attr("font-size", 0);

    const rectNetworkExitTransition = d =>
      d
        .selectAll("rect")
        .transition(t)
        .delay(0)
        .attr("y", 0)
        .attr("height", 0)
        .call(makeTransparent);

    const textExitTransition = d =>
      d
        .selectAll("text")
        .transition(t)
        .call(makeTransparent)
        .attr("font-size", 0);

    const rectExitTransition = d =>
      d
        .selectAll("rect")
        .transition(t)
        .call(makeTransparent);

    let networkRoots = alluvialDiagram
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, key);

    networkRoots
      .exit()
      .selectAll(".module")
      .selectAll(".group")
      .call(textNetworkExitTransition)
      .call(rectNetworkExitTransition);

    networkRoots
      .exit()
      .transition(t)
      .delay(delay)
      .remove();

    networkRoots = networkRoots
      .enter()
      .append("g")
      .attr("class", "networkRoot")
      .merge(networkRoots);

    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(d => d.links, key);

    const streamlineDelay = delay => (d, index, elements) => {
      const timeBudget = duration * 0.3;
      const timePerElement = timeBudget / elements.length;
      return delay + timePerElement * index;
    };

    if (networkRemoved) {
      streamlines
        .exit()
        .transition(t)
        .delay(0)
        .call(makeTransparent)
        .call(setStreamlineNetworkTransitionPath)
        .remove();

      streamlines
        .lower()
        .transition(t)
        .delay(delay)
        .call(setOpacity, 0.5)
        .call(setStreamlinePath);
    } else {
      streamlines
        .exit()
        .transition(t)
        .delay(streamlineDelay(0))
        .call(makeTransparent)
        .call(setStreamlineTransitionPath)
        .remove();

      streamlines
        .lower()
        .transition(t)
        .delay(0.5 * delay)
        .call(setOpacity, 0.5)
        .call(setStreamlinePath);
    }

    streamlines
      .enter()
      .append("path")
      .lower()
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

    modules
      .exit()
      .selectAll(".group")
      .call(textExitTransition)
      .call(rectExitTransition);

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

    if (networkRemoved) {
      groups
        .select("rect")
        .transition(t)
        .delay(delay)
        .call(makeOpaque)
        .call(setHeightY)
        .call(setWidthX);

      groups
        .select("text")
        .transition(t)
        .delay(delay)
        .call(makeOpaque)
        .call(setTextFontSize)
        .call(setTextPosition);
    } else {
      groups
        .select("rect")
        .transition(t)
        .delay(0.5 * delay)
        .call(makeOpaque)
        .call(setHeightY)
        .call(setWidthX);

      groups
        .select("text")
        .transition(t)
        .delay(0.5 * delay)
        .call(makeOpaque)
        .call(setTextFontSize)
        .call(setTextPosition);
    }

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "group");

    const rect = groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .call(makeTransparent)
      .call(setShadow)
      .attr("rx", 1)
      .attr("ry", 1)
      .attr("fill", "#B6B69F");

    const text = groupsEnter
      .append("text")
      .text(d => d.id.slice(17).slice(0, -8))
      .call(setTextPosition)
      .call(makeOpaque)
      .attr("dy", 2)
      .attr("text-anchor", "middle")
      .attr("font-size", 0);

    if (networkAdded) {
      rect
        .attr("y", 0)
        .attr("height", 0)
        .transition(t)
        .delay(delay)
        .call(setHeightY)
        .call(makeOpaque);

      text
        .attr("y", 0)
        .transition(t)
        .delay(delay)
        .call(setTextPosition)
        .call(setTextFontSize);
    } else {
      rect
        .transition(t)
        .delay(delay)
        .call(makeOpaque);

      text
        .transition(t)
        .delay(delay)
        .call(setTextFontSize);
    }
  }

  render() {
    return (
      <svg ref={node => (this.node = node)} xmlns={d3.namespaces.svg}>
        <defs />
        <LinearGradients
          defaultColor={this.defaultColor}
          highlightColors={this.highlightColors}
        />
        <g className="alluvialDiagram" />
      </svg>
    );
  }
}
