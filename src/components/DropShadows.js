import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

export default class DropShadows extends React.Component {
  static defaultProps = {
    duration: 500,
    maxLevel: 1
  };

  static propTypes = {
    duration: PropTypes.number,
    maxLevel: PropTypes.number
  };

  static getShadowUrl(level) {
    return `url(#shadow${level})`;
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const { duration, maxLevel } = this.props;

    const defs = d3.select(this.defs);

    const filters = defs.selectAll("filter").data(d3.range(1, maxLevel + 1));

    const level = level => maxLevel + 1 - level;

    filters
      .select("feDropShadow")
      .transition()
      .duration(duration)
      .attr("dx", d => 0.5 * level(d))
      .attr("dy", d => 0.5 * level(d))
      .attr("stdDeviation", d => 0.5 * level(d))
      .attr("flood-opacity", d => -0.05 * level(d) + 0.95);

    filters
      .enter()
      .append("filter")
      .attr("id", d => `shadow${d}`)
      .attr("x", "-50%")
      .attr("y", "-100%")
      .attr("width", "200%")
      .attr("height", "400%")
      .append("feDropShadow")
      .attr("dx", 0.5)
      .attr("dy", 0.5)
      .attr("stdDeviation", 0.5)
      .attr("flood-opacity", 0.9);
  }

  render() {
    return <defs ref={node => (this.defs = node)} />;
  }
}
