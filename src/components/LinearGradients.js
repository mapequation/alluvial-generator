import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

export default class LinearGradients extends React.PureComponent {
  static defaultProps = {
    defaultColor: "white",
    highlightColors: []
  };

  static propTypes = {
    defaultColor: PropTypes.string,
    highlightColors: PropTypes.arrayOf(PropTypes.string)
  };

  static getUrl = (left, right) => `url(#gradient_${left}_${right})`;

  static fill = d =>
    d.attr("fill", d =>
      LinearGradients.getUrl(d.leftHighlightIndex, d.rightHighlightIndex)
    );

  render() {
    const { defaultColor, highlightColors } = this.props;

    const highlightIndices = [-1, ...highlightColors.keys()];
    const pairs = d3.cross(highlightIndices, highlightIndices);
    const color = index =>
      index === -1 ? defaultColor : highlightColors[index];
    const id = (left, right) => `gradient_${left}_${right}`;

    return (
      <React.Fragment>
        {pairs.map(([left, right], key) => (
          <linearGradient key={key} id={id(left, right)}>
            <stop offset="15%" stopColor={color(left)} />
            <stop offset="85%" stopColor={color(right)} />
          </linearGradient>
        ))}
      </React.Fragment>
    );
  }
}
