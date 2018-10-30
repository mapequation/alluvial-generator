import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Diagram from "../alluvial/Diagram";
import {
  bracketHorizontal,
  bracketVerticalLeft,
  bracketVerticalRight
} from "../lib/bracket";
import { streamlineHorizontal } from "../lib/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";

export default class AlluvialDiagram extends React.Component {
  svg = d3.select(null);
  streamlineGenerator = streamlineHorizontal();
  bracketHorizontal = bracketHorizontal();
  bracketVertical = [bracketVerticalLeft(), bracketVerticalRight()];
  diagram = null;
  highlightColors = d3.schemeSet3;
  defaultColor = "#b6b69f";
  maxModuleLevel = 3;
  scale = 1;

  static defaultProps = {
    width: 1200,
    height: 600,
    streamlineFraction: 2,
    maxModuleWidth: 300,
    duration: 200
  };

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    streamlineFraction: PropTypes.number,
    networks: PropTypes.arrayOf(PropTypes.object),
    maxModuleWidth: PropTypes.number,
    duration: PropTypes.number
  };

  componentDidMount() {
    this.svg = d3.select(this.node);

    const zoom = d3.zoom().scaleExtent([0.1, 1000]);
    const initialTransform = d3.zoomIdentity.translate(50, 50);

    this.svg
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = this.svg
      .select("#zoomable")
      .attr("transform", initialTransform);

    let zoomTimeout = null;

    zoom.on("zoom", () => {
      const { transform } = d3.event;
      zoomable.attr("transform", transform);
      const scaleChanged = this.scale !== transform.k;
      this.scale = transform.k;
      if (scaleChanged) {
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(() => this.draw(), 50);
      }
    });

    this.update();
    this.draw();
  }

  componentDidUpdate(prevProps) {
    this.update(prevProps);
    this.draw(prevProps);
  }

  propsChanged(prevProps) {
    const { width, height, networks } = this.props;
    return {
      networkAdded: networks.length > prevProps.networks.length,
      networkRemoved: networks.length < prevProps.networks.length,
      widthChanged: width !== prevProps.width,
      heightChanged: height !== prevProps.height
    };
  }

  update(prevProps = this.props) {
    const {
      width,
      height,
      streamlineFraction,
      networks,
      maxModuleWidth
    } = this.props;
    const { networkAdded, networkRemoved } = this.propsChanged(prevProps);

    if (!this.diagram) {
      this.diagram = new Diagram(
        networks.map(({ data, name }) => ({
          nodes: data.nodes,
          id: data.meta.id,
          name
        }))
      );
    }

    if (networkAdded) {
      for (let { data, name } of networks) {
        if (!this.diagram.hasNetwork(data.meta.id)) {
          this.diagram.addNetwork({
            nodes: data.nodes,
            id: data.meta.id,
            name
          });
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

    this.diagram.calcLayout(
      width - 300,
      height - 60,
      streamlineFraction,
      maxModuleWidth
    );

    console.log(this.diagram);
  }

  draw(prevProps = this.props) {
    const { width, height, duration } = this.props;
    const {
      networkAdded,
      networkRemoved,
      widthChanged,
      heightChanged
    } = this.propsChanged(prevProps);

    const alluvialRoot = this.diagram.asObject();

    const t = d3.transition().duration(duration);
    const delay = 0.5 * duration;

    const sizeTransitionDelay = widthChanged || heightChanged ? 0.5 * delay : 0;

    const alluvialDiagram = this.svg
      .select(".alluvialDiagram")
      .attr("transform", "translate(200 10)");

    alluvialDiagram
      .transition(t)
      .delay(sizeTransitionDelay)
      .attr("width", width)
      .attr("height", height);

    const onClick = d => console.log(d);

    const onDoubleClick = d => {
      this.diagram.doubleClick(d, d3.event);
      this.update();
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

    /**
     * Network roots
     */
    let networkRoots = alluvialDiagram
      .selectAll(".networkRoot")
      .data(alluvialRoot.children, key);

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

    const moduleNameNetworkExitTransition = d =>
      d
        .selectAll(".moduleName")
        .transition(t)
        .delay(0)
        .call(makeTransparent);

    networkRoots
      .exit()
      .call(networkNameExitTransition)
      .call(rectNetworkExitTransition)
      .call(moduleNameNetworkExitTransition)
      .transition(t)
      .delay(delay)
      .remove();

    networkRoots = networkRoots
      .enter()
      .append("g")
      .attr("class", "networkRoot")
      .merge(networkRoots);

    /**
     * Network names
     */
    const networkNames = networkRoots
      .selectAll(".networkName")
      .data(d => [d.networkName]);

    networkNames.exit().remove();

    const networkNamesEnter = networkNames
      .enter()
      .append("g")
      .attr("class", "networkName")
      .call(makeTransparent);

    networkNamesEnter
      .transition(t)
      .delay(delay)
      .call(makeOpaque);

    networkNamesEnter
      .append("path")
      .attr("class", "bracket")
      .attr("fill", "transparent")
      .attr("stroke", "#999")
      .attr("stroke-linecap", "round")
      .attr("d", this.bracketHorizontal);

    networkNamesEnter
      .append("text")
      .attr("class", "name")
      .text(d => d.name)
      .attr("x", d => d.textX)
      .attr("y", d => d.textY)
      .attr("text-anchor", "middle")
      .attr("fill", "#999")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 5)
      .attr("paint-order", "stroke")
      .attr("font-size", 12)
      .attr("dy", 3);

    const networkNameUpdateDelay =
      networkAdded || !networkRemoved ? 0.5 * delay : delay;

    networkNames
      .select(".bracket")
      .transition(t)
      .delay(networkNameUpdateDelay)
      .attr("d", this.bracketHorizontal);

    networkNames
      .select(".name")
      .transition(t)
      .delay(networkNameUpdateDelay)
      .attr("x", d => d.textX)
      .attr("y", d => d.textY);

    /**
     * Streamlines
     */
    const visibleStreamlineHeight = d3
      .scaleSqrt()
      .domain([1, 1.4])
      .range([1, 0.2])
      .clamp(true);

    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(
        d =>
          d.links.filter(
            link => link.avgHeight > visibleStreamlineHeight(this.scale)
          ),
        key
      );

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
      .attr("stroke-width", 1)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("paint-order", "stroke")
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .transition(t)
      .delay(streamlineDelay(1.5 * delay))
      .call(setOpacity, 0.5)
      .call(setStreamlinePath);

    /**
     * Modules
     */
    let modules = networkRoots.selectAll(".module").data(d => d.children, key);

    const rectModuleExitTransition = d =>
      d
        .selectAll(".group")
        .selectAll("rect")
        .transition(t)
        .call(makeTransparent);

    modules
      .exit()
      .call(rectModuleExitTransition)
      .transition(t)
      .delay(delay)
      .remove();

    modules = modules
      .enter()
      .append("g")
      .attr("class", "module")
      //.call(DropShadows.filter)
      .on("dblclick", onDoubleClick)
      .on("click", onClick)
      .merge(modules);

    /**
     * Module names
     */
    const leftModuleNames = networkRoots
      .filter((d, i) => i === 0)
      .selectAll(".moduleName")
      .data(d => d.children, key);

    const rightModuleNames = networkRoots
      .filter((d, i, el) => el.length > 1 && i === el.length - 1)
      .selectAll(".moduleName")
      .data(d => d.children, key);

    networkRoots
      .filter((d, i, el) => i > 0 && i < el.length - 1)
      .selectAll(".moduleName")
      .transition(t)
      .call(makeTransparent)
      .remove();

    const numVisibleModuleNames = d3
      .scaleQuantize()
      .domain([20, 100])
      .range([1, 2, 3, 4]);

    const bracketVertical = index => d =>
      this.bracketVertical[index](d.moduleName.bracket[index]);

    const bracketDasharray = index => d => {
      const { width, height } = d.moduleName.bracket[index];
      const array =
        height < width + 3
          ? [width - 5, height + 10, width - 5, 0, height]
          : [width + height / 2, 0, width + height / 2, 0, width];
      return array.join(" ");
    };

    const tspanDy = (d, i, nodes) =>
      nodes.length === 1
        ? "0.35em"
        : i === 0
          ? `${-0.6 * (nodes.length - 1) + 0.35}em`
          : "1.2em";

    for (let [index, moduleNames] of [
      leftModuleNames,
      rightModuleNames
    ].entries()) {
      moduleNames
        .exit()
        .transition(t)
        .call(makeTransparent)
        .remove();

      const moduleNamesEnter = moduleNames
        .enter()
        .append("g")
        .attr("class", "moduleName")
        .call(makeTransparent);

      moduleNamesEnter
        .transition(t)
        .delay(delay)
        .call(makeOpaque);

      moduleNamesEnter
        .append("path")
        .attr("class", "bracket")
        .attr("fill", "transparent")
        .attr("stroke", "#999")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", bracketDasharray(index))
        .attr("d", bracketVertical(index));

      moduleNamesEnter
        .append("text")
        .attr("text-anchor", ["end", "start"][index])
        .attr("class", "name")
        .attr("y", d => d.moduleName.textY)
        .attr("fill", "#999")
        .attr("font-size", 9);

      moduleNames
        .select(".bracket")
        .transition(t)
        .delay(networkNameUpdateDelay)
        .attr("stroke-dasharray", bracketDasharray(index))
        .attr("d", bracketVertical(index));

      moduleNames
        .select(".name")
        .each(function(d) {
          d3.select(this)
            .selectAll("tspan")
            .transition(t)
            .delay(networkNameUpdateDelay)
            .attr("x", d.moduleName.textX[index]);
        })
        .transition(t)
        .delay(networkNameUpdateDelay)
        .attr("y", d => d.moduleName.textY);

      moduleNames = moduleNamesEnter.merge(moduleNames);

      const moduleNamesTspan = moduleNames
        .selectAll(".name")
        .selectAll("tspan")
        .data(
          d =>
            d.moduleName.largestLeafNodes
              .slice(0, numVisibleModuleNames(d.height))
              .map(name => ({
                name,
                x: d.moduleName.textX[index]
              })),
          function(d) {
            return d ? d.name : this.id;
          }
        );

      moduleNamesTspan
        .exit()
        .transition(t)
        .call(makeTransparent)
        .remove();

      moduleNamesTspan
        .enter()
        .append("tspan")
        .text(d => d.name)
        .attr("x", d => d.x)
        .attr("dx", [3, -3][index])
        .attr("dy", tspanDy)
        .call(makeTransparent)
        .merge(moduleNamesTspan)
        .transition(t)
        .call(makeOpaque)
        .attr("dy", tspanDy);
    }

    /**
     * Groups
     */
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
      <svg
        width="100vw"
        height="100vh"
        ref={node => (this.node = node)}
        xmlns={d3.namespaces.svg}
      >
        <defs>
          <DropShadows maxLevel={this.maxModuleLevel} />
          <LinearGradients
            defaultColor={this.defaultColor}
            highlightColors={this.highlightColors}
          />
        </defs>
        <g id="zoomable">
          <g className="alluvialDiagram" />
        </g>
      </svg>
    );
  }
}
