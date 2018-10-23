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

  static getUrl = (from, to) => `url(#gradient_${from}_${to})`;

  render() {
    const { defaultColor, highlightColors } = this.props;

    const highlightIndices = [-1, ...highlightColors.keys()];
    const pairs = d3.cross(highlightIndices, highlightIndices);
    const color = index =>
      index === -1 ? defaultColor : highlightColors[index];
    const id = pair => `gradient_${pair[0]}_${pair[1]}`;

    return (
      <defs>
        {pairs.map((pair, key) => (
          <linearGradient key={key} id={id(pair)}>
            <stop offset="5%" stopColor={color(pair[0])} />
            <stop offset="95%" stopColor={color(pair[1])} />
          </linearGradient>
        ))}
      </defs>
    );
  }
}
