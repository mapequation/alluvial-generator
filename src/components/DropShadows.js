import * as d3 from "d3";
import PropTypes from "prop-types";
import React from "react";

export default class DropShadows extends React.PureComponent {
  static defaultProps = {
    maxLevel: 1
  };

  static propTypes = {
    maxLevel: PropTypes.number
  };

  static getUrl = level => `url(#shadow${level})`;

  render() {
    const { maxLevel } = this.props;

    const levels = d3.range(1, maxLevel + 1);
    const x = level => maxLevel + 1 - level;
    const id = level => `shadow${level}`;

    return (
      <React.Fragment>
        {levels.map((level, key) => (
          <filter
            key={key}
            id={id(level)}
            x="-50%"
            y="-100%"
            width="200%"
            height="400%"
          >
            <feDropShadow
              dx={0.5 * x(level)}
              dy={0.5 * x(level)}
              stdDeviation={0.5 * x(level)}
              floodOpacity={-0.05 * x(level) + 0.95}
            />
          </filter>
        ))}
      </React.Fragment>
    );
  }
}
