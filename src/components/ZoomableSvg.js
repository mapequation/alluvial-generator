import React from "react";
import PropTypes from "prop-types";
import { event, select, zoom as zoomBehavior, zoomIdentity } from "d3";

export default class ZoomableSvg extends React.Component {
  static defaultProps = {
    width: "100vw",
    height: "100vh",
    initialTransform: zoomIdentity.translate(50, 50)
  };

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  componentDidMount() {
    const { width, height, initialTransform } = this.props;

    const zoom = zoomBehavior().scaleExtent([0.1, 1000]);

    const svg = select(this.node)
      .style("width", width)
      .attr("height", height)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = svg
      .select("#zoomable")
      .attr("transform", initialTransform);

    zoom.on("zoom", () => zoomable.attr("transform", event.transform));
  }

  render() {
    return (
      <svg ref={node => (this.node = node)}>
        <g id="zoomable">{this.props.children}</g>
      </svg>
    );
  }
}
