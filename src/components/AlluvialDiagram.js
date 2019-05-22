import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import { streamlineHorizontal } from "../lib/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";


export default class AlluvialDiagram extends React.Component {
  svg = d3.select(null);
  streamlineGenerator = streamlineHorizontal();
  maxModuleLevel = 3;

  static defaultProps = {
    defaultHighlightColor: "#b6b69f",
    highlightColors: d3.schemeSet3,
    duration: 200,
    verticalAlign: "bottom",
    showModuleId: false,
    dropShadow: false,
    onModuleClick: () => null,
    onModuleNameChange: () => null,
  };

  static propTypes = {
    height: PropTypes.number.isRequired,
    defaultHighlightColor: PropTypes.string,
    highlightColors: PropTypes.arrayOf(PropTypes.string),
    streamlineFraction: PropTypes.number.isRequired,
    moduleWidth: PropTypes.number.isRequired,
    duration: PropTypes.number,
    moduleFlowThreshold: PropTypes.number.isRequired,
    streamlineThreshold: PropTypes.number.isRequired,
    verticalAlign: PropTypes.string,
    showModuleId: PropTypes.bool,
    dropShadow: PropTypes.bool,
    onModuleClick: PropTypes.func,
    onModuleNameChange: PropTypes.func,
    onUpdateLayout: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.svg = d3.select(this.node);

    const zoom = d3.zoom().scaleExtent([0.1, 1000]);
    const initialTransform = d3.zoomIdentity.translate(0, 50);

    this.svg
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = this.svg
      .select("#zoomable")
      .attr("transform", initialTransform);

    zoom.on("zoom", () => {
      const { transform } = d3.event;
      zoomable.attr("transform", transform);
    });

    this.props.onUpdateLayout();
    this.draw();
  }

  componentDidUpdate(prevProps) {
    if (this.shouldUpdateLayout(prevProps))
      this.props.onUpdateLayout();
    this.draw();
  }

  shouldUpdateLayout(prevProps) {
    const { height, streamlineFraction, moduleWidth, moduleFlowThreshold, verticalAlign } = this.props;
    const heightChanged = height !== prevProps.height;
    const streamlineFractionChanged = streamlineFraction !== prevProps.streamlineFraction;
    const moduleWidthChanged = moduleWidth !== prevProps.moduleWidth;
    const moduleFlowThresholdChanged = moduleFlowThreshold !== prevProps.moduleFlowThreshold;
    const verticalAlignChanged = verticalAlign !== prevProps.verticalAlign;
    return heightChanged || streamlineFractionChanged || moduleWidthChanged || moduleFlowThresholdChanged || verticalAlignChanged;
  }

  draw() {
    const {
      diagram,
      defaultHighlightColor,
      highlightColors,
      duration,
      streamlineOpacity,
      streamlineThreshold,
      showModuleId,
      dropShadow,
      onModuleClick,
      onUpdateLayout,
    } = this.props;

    const alluvialRoot = diagram.asObject();

    const t = d3.transition().duration(duration);
    const delay = 0.5 * duration;

    const alluvialDiagram = this.svg
      .select(".alluvialDiagram")
      .attr("transform", "translate(200 10)");

    const onClick = d => console.log(d);

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
      .append("text")
      .attr("class", "name")
      .text(d => d.name)
      .attr("x", d => d.textX)
      .attr("y", d => d.textY)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("dy", 3);

    const networkNameUpdateDelay = 0.5 * delay;

    networkNames
      .select(".name")
      .transition(t)
      .delay(networkNameUpdateDelay)
      .attr("x", d => d.textX)
      .attr("y", d => d.textY);

    /**
     * Streamlines
     */
    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(
        d =>
          d.links.filter(link => link.avgHeight > streamlineThreshold),
        key,
      );

    const streamlineDelay = delay => (d, index, elements) => {
      const timeBudget = duration * 0.3;
      const timePerElement = timeBudget / elements.length;
      return delay + timePerElement * index;
    };

    const streamlineUpdateDelay = 0.5 * delay;

    streamlines
      .exit()
      .transition(t)
      .delay(streamlineDelay(0))
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .remove();

    streamlines
      .transition(t)
      .delay(streamlineUpdateDelay)
      .call(setOpacity, streamlineOpacity)
      .call(setStreamlinePath);

    function highlightConnectedModules(modules, streamline, strokeOpacity = null, stroke = null) {
      modules
        .filter(group => group.id === streamline.sourceId || group.id === streamline.targetId)
        .select("rect")
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke", stroke);
    }

    function highlightStreamline(d) {
      d3.select(this)
        .attr("stroke", "#f00");

      d3.selectAll(".group")
        .call(highlightConnectedModules, d, 0.5, "#f00");
    }

    function dehighlightStreamline(d) {
      d3.select(this)
        .call(LinearGradients.stroke);

      d3.selectAll(".group")
        .call(highlightConnectedModules, d);
    }

    const onDoubleClick = context => function (d) {
      const success = diagram.doubleClick(d, d3.event);
      if (success) {
        context.update();
        context.draw();
      } else {
        wiggle.call(this, d);
      }
    };

    streamlines
      .enter()
      .append("path")
      .attr("class", "streamline")
      .on("click", onClick)
      .on("dblclick", onDoubleClick(this))
      .on("mouseover", highlightStreamline)
      .on("mouseout", dehighlightStreamline)
      .call(LinearGradients.fill)
      .call(LinearGradients.stroke)
      .attr("stroke-width", 1)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("paint-order", "stroke")
      .call(makeTransparent)
      .call(setStreamlineTransitionPath)
      .transition(t)
      .delay(streamlineDelay(1.5 * delay))
      .call(setOpacity, streamlineOpacity)
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

    function wiggle() {
      const duration = 80;
      const dx = 8;

      d3.select(this)
        .attr("transform", null)
        .transition()
        .ease(d3.easeSin)
        .duration(duration)
        .attr("transform", `translate(${1.5 * dx} 0)`)
        .transition()
        .ease(d3.easeSin)
        .duration(2 * duration)
        .attr("transform", `translate(-${dx} 0)`)
        .transition()
        .ease(d3.easeSin)
        .duration(2 * duration)
        .attr("transform", `translate(${dx / 2} 0)`)
        .transition()
        .ease(d3.easeSin)
        .duration(duration)
        .attr("transform", "translate(0 0)");
    }

    function restoreMouseOver(selection) {
      selection
        .on("mouseover", function () {
          d3.select(this)
            .attr("stroke-opacity", 0.5);
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("stroke-opacity", 0);
        });
    }

    this.svg.select(".background")
      .on("click", () => {
        d3.selectAll(".module")
          .call(restoreMouseOver)
          .transition()
          .attr("stroke-opacity", 0);

        onModuleClick(null);
      });

    modules = modules
      .enter()
      .append("g")
      .attr("class", "module")
      .attr("stroke", "#f00")
      .attr("stroke-opacity", 0)
      .call(restoreMouseOver)
      .on("dblclick", onDoubleClick(this))
      .on("click", function (d) {
        console.log(d);

        const removeEventHandler = context => function (selection, event) {
          const handler = selection.on(event);
          selection.on(event, function () {
            return context === this ? null : handler.call(this);
          });
        };

        d3.selectAll(".module")
          .call(removeEventHandler(this), "mouseover")
          .call(removeEventHandler(this), "mouseout")
          .transition()
          .attr("stroke-opacity", (context => function () {
            return context === this ? 1 : 0;
          })(this));

        onModuleClick.call(this, d);
      })
      .merge(modules);

    modules.call(DropShadows.filter(dropShadow));

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
      .domain([0, 100])
      .range([1, 2, 3, 4]);

    const tspanDy = (d, i, nodes) =>
      nodes.length === 1
        ? "0.35em"
        : i === 0
        ? `${-0.6 * (nodes.length - 1) + 0.35}em`
        : "1.2em";

    const moduleNameUpdateDelay = networkNameUpdateDelay;

    for (let [index, moduleNames] of [leftModuleNames, rightModuleNames].entries()) {
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
        .append("text")
        .attr("text-anchor", ["end", "start"][index])
        .attr("class", "name")
        .attr("y", d => d.moduleNamePosition.y)
        .attr("font-size", 9);

      moduleNames
        .select(".name")
        .each(function (d) {
          d3.select(this)
            .selectAll("tspan")
            .transition(t)
            .delay(moduleNameUpdateDelay)
            .attr("x", d.moduleNamePosition.x[index]);
        })
        .transition(t)
        .delay(moduleNameUpdateDelay)
        .attr("y", d => d.moduleNamePosition.y);

      moduleNames = moduleNamesEnter.merge(moduleNames);

      const moduleNamesTspan = moduleNames
        .selectAll(".name")
        .selectAll("tspan")
        .data(
          d => d.name
            ? [{ name: d.name, x: d.moduleNamePosition.x[index] }]
            : d.largestLeafNodes
              .slice(0, numVisibleModuleNames(d.height))
              .map(name => ({ name, x: d.moduleNamePosition.x[index] })),
          function (d) {
            return d ? d.name : this.id;
          },
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

    const rectUpdateDelay = 0.5 * delay;

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
        ? defaultHighlightColor
        : highlightColors[d.highlightIndex];

    const rect = groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .call(makeTransparent)
      .on("click", onClick)
      .attr("fill", highlightColor);

    rect
      .transition(t)
      .delay(delay)
      .call(setHeightY)
      .call(makeOpaque);

    /**
     * Module IDs
     */
    if (showModuleId) {
      const moduleId = networkRoots.selectAll(".moduleId").data(d => d.children, key);

      moduleId
        .exit()
        .remove();

      moduleId
        .transition(t)
        .delay(moduleNameUpdateDelay)
        .attr("y", d => d.moduleIdPosition.y)
        .attr("x", d => d.moduleIdPosition.x);

      moduleId
        .enter()
        .append("text")
        .attr("class", "moduleId")
        .text(d => d.moduleId)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("paint-order", "stroke")
        .attr("stroke-linecap", "round")
        .attr("dy", 3)
        .attr("y", d => d.moduleIdPosition.y)
        .attr("x", d => d.moduleIdPosition.x)
        .call(makeTransparent)
        .transition(t)
        .delay(moduleNameUpdateDelay)
        .call(makeOpaque);
    } else {
      networkRoots
        .selectAll(".moduleId")
        .transition(t)
        .call(makeTransparent)
        .delay(moduleNameUpdateDelay)
        .remove();
    }
  }

  render() {
    const {
      defaultHighlightColor,
      highlightColors,
    } = this.props;

    return (
      <svg
        style={{ width: "100vw", height: "100vh" }}
        ref={node => (this.node = node)}
        xmlns={d3.namespaces.svg}
        xmlnsXlink={d3.namespaces.xlink}
        id="alluvialSvg"
      >
        <defs>
          <DropShadows maxLevel={this.maxModuleLevel}/>
          <LinearGradients
            defaultColor={defaultHighlightColor}
            highlightColors={highlightColors}
          />
        </defs>
        <rect className="background" width="100%" height="100%" fill="#fff"/>
        <g id="zoomable">
          <g className="alluvialDiagram"/>
        </g>
      </svg>
    );
  }
}
