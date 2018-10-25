import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Diagram from "../alluvial/Diagram";
import { bracketHorizontal, bracketVertical } from "../lib/bracket";
import { streamlineHorizontal } from "../lib/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";

export default class AlluvialDiagram extends React.Component {
  svg = d3.select(null);
  streamlineGenerator = streamlineHorizontal();
  bracketHorizontal = bracketHorizontal();
  bracketVertical = bracketVertical();
  diagram = null;
  highlightColors = d3.schemeSet3;
  defaultColor = "#b6b69f";
  maxModuleLevel = 3;

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

  componentDidMount() {
    this.svg = d3.select(this.node);
    this.draw();
  }

  componentDidUpdate(prevProps) {
    this.draw(prevProps);
  }

  draw(prevProps = this.props) {
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
        networks.map(({ data: { nodes, meta } }) => ({ nodes, id: meta.id }))
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

    this.diagram.calcLayout(width - 50, height - 60, streamlineFraction);
    const alluvialRoot = this.diagram.asObject();

    console.log(this.diagram);

    const t = d3.transition().duration(duration);
    const delay = 0.5 * duration;

    const svgTransitionDelay =
      width !== prevProps.width || height !== prevProps.height
        ? 0.5 * delay
        : 0;

    this.svg
      .transition(t)
      .delay(svgTransitionDelay)
      .attr("width", width)
      .attr("height", height);

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
    const setOpacity = (d, opacity) => d.attr("opacity", opacity);
    const makeTransparent = d => setOpacity(d, 0);
    const makeOpaque = d => setOpacity(d, 1);
    const setStreamlinePath = (d, path = "path") =>
      d.attr("d", d => this.streamlineGenerator(d[path]));
    const setStreamlineTransitionPath = d =>
      setStreamlinePath(d, "transitionPath");
    const setStreamlineNetworkTransitionPath = d =>
      setStreamlinePath(d, "networkTransitionPath");

    const rectNetworkExitTransition = d =>
      d
        .selectAll(".module")
        .selectAll(".group")
        .selectAll("rect")
        .transition(t)
        .delay(0)
        .attr("y", 0)
        .attr("height", 0)
        .call(makeTransparent);

    const networkNameExitTransition = d =>
      d
        .select(".networkName")
        .transition(t)
        .delay(0)
        .call(makeTransparent);

    let networkRoots = alluvialDiagram
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, key);

    networkRoots
      .exit()
      .call(networkNameExitTransition)
      .call(rectNetworkExitTransition)
      .transition(t)
      .delay(delay)
      .remove();

    const networkRootsEnter = networkRoots
      .enter()
      .append("g")
      .attr("class", "networkRoot");

    const networkNames = networkRootsEnter
      .append("g")
      .attr("class", "networkName")
      .call(makeTransparent);

    networkNames
      .append("path")
      .attr("class", "bracket")
      .attr("fill", "transparent")
      .attr("stroke", "#999")
      .attr("d", d => this.bracketHorizontal(d.bracket));

    networkNames
      .append("text")
      .attr("class", "name")
      .text(d => d.id)
      .attr("x", d => d.bracket.textX)
      .attr("y", d => d.bracket.textY)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("stroke", "white")
      .attr("stroke-width", 5)
      .attr("paint-order", "stroke")
      .attr("font-size", 12)
      .attr("dy", 3);

    const networkNameUpdateDelay =
      networkAdded || !networkRemoved ? 0.5 * delay : delay;

    networkRoots
      .select(".networkName")
      .select(".bracket")
      .transition(t)
      .delay(networkNameUpdateDelay)
      .attr("d", d => this.bracketHorizontal(d.bracket));

    networkRoots
      .select(".networkName")
      .select(".name")
      .transition(t)
      .delay(networkNameUpdateDelay)
      .attr("x", d => d.bracket.textX)
      .attr("y", d => d.bracket.textY);

    networkNames
      .transition(t)
      .delay(delay)
      .call(makeOpaque);

    networkRoots = networkRoots.merge(networkRootsEnter);

    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(d => d.links, key);

    const streamlineDelay = delay => (d, index, elements) => {
      const timeBudget = duration * 0.3;
      const timePerElement = timeBudget / elements.length;
      return delay + timePerElement * index;
    };

    const streamlineUpdateDelay = networkRemoved ? delay : 0.5 * delay;
    const streamlineExitDelay = networkRemoved ? 0 : streamlineDelay(0);
    const streamlineTransition = networkRemoved
      ? setStreamlineNetworkTransitionPath
      : setStreamlineTransitionPath;

    streamlines
      .exit()
      .transition(t)
      .delay(streamlineExitDelay)
      .call(makeTransparent)
      .call(streamlineTransition)
      .remove();

    streamlines
      .lower()
      .transition(t)
      .delay(streamlineUpdateDelay)
      .call(setOpacity, 0.5)
      .call(setStreamlinePath);

    streamlines
      .enter()
      .append("path")
      .lower()
      .attr("class", "streamline")
      .on("click", onClick)
      .call(LinearGradients.fill)
      .call(LinearGradients.stroke)
      .attr("stroke-width", d => d.strokeWidth)
      .attr("paint-order", "stroke")
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .transition(t)
      .delay(streamlineDelay(1.5 * delay))
      .call(setOpacity, 0.5)
      .call(setStreamlinePath);

    let modules = networkRoots.selectAll(".module").data(d => d.children, key);

    const rectGroupExitTransition = d =>
      d
        .selectAll(".group")
        .selectAll("rect")
        .transition(t)
        .call(makeTransparent);

    modules
      .exit()
      .call(rectGroupExitTransition)
      .transition(t)
      .delay(delay)
      .remove();

    modules = modules
      .enter()
      .append("g")
      .attr("class", "module")
      .call(DropShadows.filter)
      .on("dblclick", onDoubleClick)
      .merge(modules);

    const groups = modules.selectAll(".group").data(d => d.children, key);

    groups.exit().remove();

    const rectUpdateDelay = networkRemoved ? delay : 0.5 * delay;

    groups
      .select("rect")
      .transition(t)
      .delay(rectUpdateDelay)
      .call(makeOpaque)
      .call(setHeightY)
      .call(setWidthX);

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "group");

    const highlightColor = d =>
      d.highlightIndex === -1
        ? this.defaultColor
        : this.highlightColors[d.highlightIndex];

    const rect = groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .call(makeTransparent)
      .on("click", onClick)
      .attr("fill", highlightColor);

    if (networkAdded) {
      rect.attr("y", 0).attr("height", 0);
    }

    rect
      .transition(t)
      .delay(delay)
      .call(setHeightY)
      .call(makeOpaque);
  }

  render() {
    return (
      <svg ref={node => (this.node = node)} xmlns={d3.namespaces.svg}>
        <defs>
          <DropShadows maxLevel={this.maxModuleLevel} />
          <LinearGradients
            defaultColor={this.defaultColor}
            highlightColors={this.highlightColors}
          />
        </defs>
        <g className="alluvialDiagram" />
      </svg>
    );
  }
}
