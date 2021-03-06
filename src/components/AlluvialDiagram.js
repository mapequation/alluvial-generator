import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

import Diagram from "../alluvial/Diagram";
import Dispatch from "../context/Dispatch";
import { saveDiagram } from "../io/export";
import highlightColor from "../lib/highlight-color";
import { streamlineHorizontal } from "../lib/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";
import ZoomableSvg from "./ZoomableSvg";


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

function clearStreamlineHighlight(d) {
  d3.select(this)
    .call(LinearGradients.stroke);

  d3.selectAll(".group")
    .call(highlightConnectedModules, d);
}

function restoreMouseOver(selection) {
  selection
    .on("mouseover", function() {
      d3.select(this)
        .attr("stroke-opacity", 0.5);
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("stroke-opacity", 0);
    });
}

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

export default class AlluvialDiagram extends React.PureComponent {
  svg = d3.select(null);
  streamlineGenerator = streamlineHorizontal();
  maxModuleLevel = 3;

  static contextType = Dispatch;

  static propTypes = {
    networks: PropTypes.arrayOf(PropTypes.any).isRequired,
    height: PropTypes.number.isRequired,
    moduleWidth: PropTypes.number.isRequired,
    streamlineFraction: PropTypes.number.isRequired,
    streamlineThreshold: PropTypes.number.isRequired,
    streamlineOpacity: PropTypes.number.isRequired,
    moduleFlowThreshold: PropTypes.number.isRequired,
    nameChangeBit: PropTypes.number.isRequired,
    colorChangeBit: PropTypes.number.isRequired,
    colorChangeNodesBit: PropTypes.number.isRequired,
    colorChangeModuleIdsBit: PropTypes.number.isRequired,
    autoPaintNodesBit: PropTypes.number.isRequired,
    removeColorsBit: PropTypes.number.isRequired,
    saveDiagramBit: PropTypes.number.isRequired,
    selectedModule: PropTypes.object,
    duration: PropTypes.number,
    marginExponent: PropTypes.number,
    verticalAlign: PropTypes.string,
    showModuleId: PropTypes.bool,
    showModuleNames: PropTypes.bool,
    showNetworkNames: PropTypes.bool,
    dropShadow: PropTypes.bool,
    fontSize: PropTypes.number,
    defaultHighlightColor: PropTypes.string,
    moduleSize: PropTypes.string,
    sortModulesBy: PropTypes.string,
    clearFiltersBit: PropTypes.number,
    highlightColors: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  static defaultProps = {
    duration: 200,
    marginExponent: 5,
    verticalAlign: "bottom",
    showModuleId: false,
    dropShadow: false,
    fontSize: 10,
    moduleSize: "flow",
    sortModulesBy: "flow",
    defaultHighlightColor: "#b6b69f"
  };

  componentDidMount() {
    this.svg = d3.select(this.node);
    this.diagram = new Diagram(this.props.networks);

    if (this.props.modulesVisibleInFilter) {
      this.diagram.setVisibleModules(this.props.modulesVisibleInFilter);
    }

    this.update();
    this.draw();
    this.context.dispatch({ type: "setVisibleModules", value: this.diagram.getVisibleModules() });
  }

  componentDidUpdate(prev) {
    const {
      networks,
      height,
      duration,
      marginExponent,
      moduleWidth,
      moduleFlowThreshold,
      streamlineFraction,
      streamlineOpacity,
      streamlineThreshold,
      verticalAlign,
      showModuleId,
      showModuleNames,
      showNetworkNames,
      dropShadow,
      fontSize,
      defaultHighlightColor,
      highlightColors,
      selectedModule,
      nameChangeBit,
      colorChangeBit,
      colorChangeNodesBit,
      colorChangeModuleIdsBit,
      autoPaintNodesBit,
      autoPaintModuleIdsBit,
      removeColorsBit,
      highlightNodesBit,
      highlightedNodes,
      expandBit,
      regroupBit,
      saveDiagramBit,
      moduleSize,
      sortModulesBy,
      modulesVisibleInFilter,
      clearFiltersBit
    } = this.props;

    const { dispatch } = this.context;

    if (selectedModule) {
      if (nameChangeBit !== prev.nameChangeBit) {
        this.diagram.setModuleName(selectedModule);
        this.diagram.setNetworkName(selectedModule);
      }
      if (colorChangeBit !== prev.colorChangeBit) {
        this.diagram.setModuleColor(selectedModule);
      }
      if (colorChangeNodesBit !== prev.colorChangeNodesBit) {
        this.diagram.setModuleColor(selectedModule, true);
      }
      if (colorChangeModuleIdsBit !== prev.colorChangeModuleIdsBit) {
        this.diagram.setModuleColor(selectedModule, false, true);
      }
      if (expandBit !== prev.expandBit) {
        this.diagram.doubleClick(selectedModule);
      } else if (regroupBit !== prev.regroupBit) {
        this.diagram.doubleClick(selectedModule, { shiftKey: true });
      }
    }

    if (autoPaintNodesBit !== prev.autoPaintNodesBit) {
      this.diagram.autoPaint(selectedModule, highlightColors, true);
    }

    if (autoPaintModuleIdsBit !== prev.autoPaintModuleIdsBit) {
      this.diagram.autoPaint(selectedModule, highlightColors, false, true);
    }

    if (removeColorsBit !== prev.removeColorsBit) {
      this.diagram.removeColors();
    }

    if (modulesVisibleInFilter) {
      this.diagram.setVisibleModules(modulesVisibleInFilter);
    }

    if (clearFiltersBit !== prev.clearFiltersBit) {
      this.diagram.clearFilters();
    }

    if (highlightNodesBit !== prev.highlightNodesBit) {
      this.diagram.setNodesColors(highlightedNodes);
    }

    if (this.shouldUpdateLayout(prev)) {
      this.update();
      dispatch({ type: "setVisibleModules", value: this.diagram.getVisibleModules() });
    }

    this.draw();

    if (saveDiagramBit !== prev.saveDiagramBit) {
      const state = {
        height,
        duration,
        marginExponent,
        moduleWidth,
        moduleFlowThreshold,
        streamlineFraction,
        streamlineOpacity,
        streamlineThreshold,
        verticalAlign,
        showModuleId,
        showModuleNames,
        showNetworkNames,
        dropShadow,
        fontSize,
        defaultHighlightColor,
        highlightColors,
        moduleSize,
        sortModulesBy,
        modulesVisibleInFilter
      };
      saveDiagram(process.env.REACT_APP_VERSION, networks, this.diagram.alluvialRoot, state);
    }
  }

  shouldUpdateLayout(prev) {
    const {
      height,
      marginExponent,
      streamlineFraction,
      moduleWidth,
      moduleFlowThreshold,
      verticalAlign,
      colorChangeBit,
      colorChangeNodesBit,
      colorChangeModuleIdsBit,
      autoPaintNodesBit,
      autoPaintModuleIdsBit,
      removeColorsBit,
      highlightNodesBit,
      expandBit,
      regroupBit,
      moduleSize,
      sortModulesBy,
      modulesVisibleInFilter,
      clearFiltersBit
    } = this.props;

    const layoutChanged =
      height !== prev.height || marginExponent !== prev.marginExponent ||
      streamlineFraction !== prev.streamlineFraction || moduleWidth !== prev.moduleWidth ||
      moduleFlowThreshold !== prev.moduleFlowThreshold || verticalAlign !== prev.verticalAlign ||
      moduleSize !== prev.moduleSize || sortModulesBy !== prev.sortModulesBy;
    const colorChanged =
      colorChangeBit !== prev.colorChangeBit || colorChangeNodesBit !== prev.colorChangeNodesBit ||
      colorChangeModuleIdsBit !== prev.colorChangeModuleIdsBit ||
      autoPaintNodesBit !== prev.autoPaintNodesBit || autoPaintModuleIdsBit !== prev.autoPaintModuleIdsBit ||
      removeColorsBit !== prev.removeColorsBit ||
      highlightNodesBit !== prev.highlightNodesBit;
    const expanded = expandBit !== prev.expandBit;
    const regrouped = regroupBit !== prev.regroupBit;
    const visibleModulesChanged = modulesVisibleInFilter !== prev.modulesVisibleInFilter;
    const clearFilterChanged = clearFiltersBit !== prev.clearFiltersBit;

    return (
      layoutChanged ||
      colorChanged ||
      expanded ||
      regrouped ||
      visibleModulesChanged ||
      clearFilterChanged
    );
  }

  update() {
    const {
      height, marginExponent, streamlineFraction, moduleWidth, moduleFlowThreshold, verticalAlign, moduleSize, sortModulesBy
    } = this.props;

    this.diagram.updateLayout(
      height,
      streamlineFraction,
      moduleWidth,
      moduleFlowThreshold,
      verticalAlign,
      marginExponent,
      moduleSize,
      sortModulesBy);
  }

  draw() {
    const {
      defaultHighlightColor,
      highlightColors,
      duration,
      streamlineOpacity,
      streamlineThreshold,
      showModuleId,
      showModuleNames,
      showNetworkNames,
      dropShadow,
      fontSize
    } = this.props;
    const { dispatch } = this.context;

    const alluvialRoot = this.diagram.asObject();

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
    const networkNameUpdateDelay = 0.5 * delay;

    if (showNetworkNames) {
      const networkNames = networkRoots
        .selectAll(".networkName")
        .data(d => [d.networkName]);

      networkNames.exit().remove();

      networkNames
        .select("text")
        .transition(t)
        .attr("font-size", fontSize);

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
        .style("cursor", "default")
        .text(d => d.name)
        .attr("x", d => d.textX)
        .attr("y", d => d.textY)
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize)
        .attr("dy", 3);

      networkNames
        .select(".name")
        .text(d => d.name)
        .transition(t)
        .delay(networkNameUpdateDelay)
        .attr("x", d => d.textX)
        .attr("y", d => d.textY);
    } else {
      networkRoots
        .selectAll(".networkName")
        .transition(t)
        .call(makeTransparent)
        .delay(networkNameUpdateDelay)
        .remove();
    }

    /**
     * Streamlines
     */
    const streamlines = networkRoots
      .selectAll(".streamline")
      .data(
        d =>
          d.links.filter(link => link.avgHeight > streamlineThreshold),
        key
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

    const onDoubleClick = (context => function(d) {
      const success = context.diagram.doubleClick(d, d3.event);
      if (success) {
        context.update();
        dispatch({ type: "setVisibleModules", value: context.diagram.getVisibleModules() });
        context.draw();
      } else {
        wiggle.call(this, d);
      }
    })(this);

    let streamlinesEnter = streamlines
      .enter()
      .append("path")
      .attr("class", "streamline")
      .style("cursor", "pointer")
      .on("click", onClick)
      .on("dblclick", onDoubleClick)
      .on("mouseover", highlightStreamline)
      .on("mouseout", clearStreamlineHighlight)
      .call(LinearGradients.fill)
      .call(LinearGradients.stroke)
      .attr("stroke-width", 1)
      .attr("vector-effect", "non-scaling-stroke")
      .attr("paint-order", "stroke")
      .call(makeTransparent)
      .call(setStreamlineTransitionPath);

    streamlinesEnter
      .transition(t)
      .delay(streamlineDelay(1.5 * delay))
      .call(setOpacity, streamlineOpacity)
      .call(setStreamlinePath);

    streamlinesEnter
      .merge(streamlines)
      .sort((a, b) =>
        a.highlightIndex !== b.highlightIndex ? a.highlightIndex - b.highlightIndex : b.avgHeight - a.avgHeight);

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
      .style("cursor", "pointer")
      .attr("stroke", "#f00")
      .attr("stroke-opacity", 0)
      .call(restoreMouseOver)
      .on("dblclick", onDoubleClick)
      .on("click", function(d) {
        console.log(d);

        const removeEventHandler = context => function(selection, event) {
          const handler = selection.on(event);
          selection.on(event, function() {
            return context === this ? null : handler.call(this);
          });
        };

        d3.selectAll(".module")
          .call(removeEventHandler(this), "mouseover")
          .call(removeEventHandler(this), "mouseout")
          .attr("stroke-opacity", (context => function() {
            return context === this ? 1 : 0;
          })(this));

        dispatch({ type: "selectedModule", value: d });
      })
      .merge(modules);

    modules.call(DropShadows.filter(dropShadow));

    /**
     * Module names
     */
    const moduleNameUpdateDelay = networkNameUpdateDelay;

    if (showModuleNames) {
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

      for (let [index, moduleNames] of [leftModuleNames, rightModuleNames].entries()) {
        moduleNames
          .exit()
          .transition(t)
          .call(makeTransparent)
          .remove();

        moduleNames
          .select("text")
          .transition(t)
          .attr("font-size", fontSize);

        const moduleNamesEnter = moduleNames
          .enter()
          .append("g")
          .attr("class", "moduleName")
          .style("cursor", "default")
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
          .attr("font-size", fontSize);

        moduleNames
          .select(".name")
          .each(function(d) {
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
            d => (d.name || d.largestLeafNodes)
              .slice(0, numVisibleModuleNames(d.height))
              .map(name => ({ name, x: d.moduleNamePosition.x[index] })),
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
    } else {
      networkRoots
        .selectAll(".moduleName")
        .transition(t)
        .call(makeTransparent)
        .delay(moduleNameUpdateDelay)
        .remove();
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

    const groupFillColor = highlightColor(defaultHighlightColor, highlightColors);

    groups
      .select("rect")
      .attr("fill", groupFillColor);

    const rect = groupsEnter
      .append("rect")
      .call(setWidthX)
      .call(setHeightY)
      .call(makeTransparent)
      .on("click", onClick)
      .attr("fill", groupFillColor);

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
        .attr("font-size", fontSize)
        .attr("y", d => d.moduleIdPosition.y)
        .attr("x", d => d.moduleIdPosition.x);

      moduleId
        .enter()
        .append("text")
        .attr("class", "moduleId")
        .attr("pointer-events", "none")
        .text(d => d.moduleId)
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize)
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
    const { defaultHighlightColor, highlightColors } = this.props;
    const { dispatch } = this.context;

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
        <ZoomableSvg onClick={() => {
          d3.selectAll(".module")
            .call(restoreMouseOver)
            .attr("stroke-opacity", 0);

          dispatch({ type: "selectedModule", value: null });
        }}>
          <g className="alluvialDiagram"/>
        </ZoomableSvg>
      </svg>
    );
  }
}
