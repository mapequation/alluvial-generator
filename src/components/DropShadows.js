import { range } from "d3";
import PropTypes from "prop-types";
import React from "react";


const id = level => `shadow${level}`;

export default class DropShadows extends React.PureComponent {
  static propTypes = {
    maxLevel: PropTypes.number
  };

  static defaultProps = {
    maxLevel: 1
  };

  static getUrl = level => `url(#${id(level)})`;

  static filter = (enabled = true) => d =>
    d.style("filter", enabled ? d => DropShadows.getUrl(d.moduleLevel) : null);

  render() {
    const { maxLevel } = this.props;

    const levels = range(1, maxLevel + 1);
    const x = level => maxLevel + 1 - level;

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
