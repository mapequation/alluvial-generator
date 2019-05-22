import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";


export default class ZoomableSvg extends React.PureComponent {
  static defaultProps = {
    width: "100vw",
    height: "100vh",
    onClick: () => null,
  };

  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClick: PropTypes.func,
  };

  componentDidMount() {
    const { onClick } = this.props;

    const zoom = d3.zoom()
      .scaleExtent([0.1, 1000]);

    const initialTransform = d3.zoomIdentity.translate(0, 50);

    const svg = d3.select(this.node)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = svg.select("#zoomable")
      .attr("transform", initialTransform);

    zoom.on("zoom", () => zoomable.attr("transform", d3.event.transform));

    svg.select(".background")
      .on("click", onClick);
  }

  render() {
    const { width, height, children } = this.props;
    return (
      <svg
        style={{ width, height }}
        ref={node => this.node = node}
        xmlns={d3.namespaces.svg}
        xmlnsXlink={d3.namespaces.xlink}
      >
        <rect className="background" width="100%" height="100%" fill="#fff"/>
        <g id="zoomable">{children}</g>
      </svg>
    );
  }
}
