import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

export default class LinearGradients extends React.Component {
  static defaultProps = {
    defaultColor: "white",
    highlightColors: []
  };

  static propTypes = {
    defaultColor: PropTypes.string,
    highlightColors: PropTypes.arrayOf(PropTypes.string)
  };

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const { defaultColor, highlightColors } = this.props;

    const defs = d3.select(this.defs);
    const highlightIndices = [-1, ...highlightColors.keys()];
    const color = index =>
      index === -1 ? defaultColor : highlightColors[index];

    const gradients = defs
      .selectAll("linearGradient")
      .data(d3.cross(highlightIndices, highlightIndices));

    gradients.exit().remove();

    gradients
      .enter()
      .append("linearGradient")
      .attr("id", d => `gradient_${d[0]}_${d[1]}`)
      .selectAll("stop")
      .data(d => [
        { offset: "5%", color: color(d[0]) },
        { offset: "95%", color: color(d[1]) }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);
  }

  render() {
    return <defs ref={node => (this.defs = node)} />;
  }
}
