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

  propsChanged(props, prevProps) {
    return {
      networkRemoved: props.networks.length < prevProps.networks.length,
      networkAdded: props.networks.length > prevProps.networks.length,
      widthChanged: props.width !== prevProps.width,
      heightChanged: props.height !== prevProps.height,
      streamlineFractionChanged:
        props.streamlineFraction !== prevProps.streamlineFraction
    };
  }

  async draw(prevProps = this.props) {
    const {
      width,
      height,
      streamlineFraction,
      duration,
      networks
    } = this.props;

    this.diagram.calcLayout(width, height, streamlineFraction);
    const alluvialRoot = this.diagram.asObject();

    console.log(this.diagram);
    console.log(alluvialRoot);

    const t = d3.transition().duration(duration);

    this.svg
      .attr("width", alluvialRoot.width)
      .attr("height", alluvialRoot.height);

    const g = this.svg.select(".alluvial-diagram");

    const onClick = d => {
      console.log(d);
    };

    const onDoubleClick = d => {
      this.diagram.doubleClick(d);
      //g.selectAll("*").remove();
      this.draw(prevProps);
    };

    let roots = g
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, function key(d) {
        console.log("root.id", d.id);
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
        console.log("streamline.leftId", d.leftId);
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
      .delay(staggeredDelay(2 * duration))
      .attr("d", this.streamlineGenerator);

    let modules = roots
      .selectAll(".module")
      .data(d => d.children, function key(d) {
        console.log("module.id", d.id);
        return d ? d.id : this.id;
      });

    modules
      .exit()
      .transition(t)
      .remove();

    modules = modules
      .enter()
      .append("g")
      .merge(modules)
      .attr("class", "module")
      .on("click", onClick)
      .on("dblclick", onDoubleClick);

    const groups = modules
      .selectAll(".group")
      .data(d => d.children, function key(d) {
        console.log("group.id", d.id);
        return d ? d.id : this.id;
      });

    const setX = d => d.attr("x", d => d.x);
    const setY = d => d.attr("y", d => d.y);
    const setWidth = d => d.attr("width", d => d.width);
    const setHeight = d => d.attr("height", d => d.height);
    const setWidthX = d => setWidth(setX(d));
    const setHeightY = d => setHeight(setY(d));

    groups
      .exit()
      .selectAll("rect")
      .transition(t)
      .attr("opacity", 0)
      .remove();

    console.warn(groups.exit().select("text"));

    groups
      .exit()
      .selectAll("text")
      .transition(t)
      .attr("x", -1000000)
      .attr("font-size", 0)
      .remove();

    groups
      .exit()
      .transition(t)
      .remove();

    groups
      .select("rect")
      .transition(t)
      .call(setHeightY);

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "group");

    groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .attr("fill", "#B6B69F")
      .attr("stroke-location", "outside")
      .attr("opacity", 0)
      .transition(t)
      .delay(duration)
      .attr("opacity", 1);

    groupsEnter
      .filter(d => d.flow > 1e-2)
      .append("text")
      .text(d => d.id)
      .attr("font-size", d => d.flow * 5 + 10)
      .attr("x", d => d.x + d.width / 2)
      .attr("y", d => d.y + d.height / 2)
      .attr("dy", 4)
      .attr("text-anchor", "middle");
  }

  render() {
    return (
      <svg ref={node => (this.node = node)} xmlns={d3.namespaces.svg}>
        <g className="alluvial-diagram" />
      </svg>
    );
  }
}
