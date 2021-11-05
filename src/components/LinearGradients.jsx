import { cross, hsl as d3_hsl } from "d3";
import PropTypes from "prop-types";
import React from "react";
import { NOT_HIGHLIGHTED } from "../alluvial/HighlightGroup";
import highlightColor from "../lib/highlight-color";


const id = (left, right, leftInsignificant, rightInsignificant) =>
  `gradient_${left}${leftInsignificant ? "i" : ""}_${right}${rightInsignificant ? "i" : ""}`;

const strokeId = (left, right) => `gradient-stroke_${left}_${right}`;

const stroke = (color, highlightIndex) => {
  if (highlightIndex === NOT_HIGHLIGHTED) {
    return "#fff";
  }

  const hsl = d3_hsl(color);
  hsl.s += 0.2;
  hsl.l -= 0.2;
  return hsl.toString();
};

export default class LinearGradients extends React.PureComponent {
  static propTypes = {
    defaultColor: PropTypes.string,
    highlightColors: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    defaultColor: "white",
    highlightColors: []
  };

  static fill = d =>
    d.attr(
      "fill",
      d => `url(#${id(d.leftHighlightIndex, d.rightHighlightIndex, d.leftInsignificant, d.rightInsignificant)})`
    );

  static stroke = d =>
    d.attr(
      "stroke",
      d => `url(#${strokeId(d.leftHighlightIndex, d.rightHighlightIndex)})`
    );

  render() {
    const { defaultColor, highlightColors } = this.props;

    const highlightIndices = [NOT_HIGHLIGHTED, ...highlightColors.keys()];
    const pairs = cross(highlightIndices, highlightIndices);
    const color = highlightColor(defaultColor, highlightColors);

    const leftOffset = "15%";
    const rightOffset = "85%";

    const insignificant = cross([true, false], [true, false]);

    return (
      <>
        {
          insignificant.map(([leftInsignificant, rightInsignificant], i) =>
            pairs.map(([leftHighlightIndex, rightHighlightIndex], j) =>
              <React.Fragment key={`${i}_${j}}`}>
                <linearGradient
                  id={id(leftHighlightIndex, rightHighlightIndex, leftInsignificant, rightInsignificant)}>
                  <stop
                    offset={leftOffset}
                    stopColor={color({ highlightIndex: leftHighlightIndex, insignificant: leftInsignificant })}
                  />
                  <stop
                    offset={rightOffset}
                    stopColor={color({ highlightIndex: rightHighlightIndex, insignificant: rightInsignificant })}
                  />
                </linearGradient>
                <linearGradient id={strokeId(leftHighlightIndex, rightHighlightIndex)}>
                  <stop
                    offset={leftOffset}
                    stopColor={stroke(color({ highlightIndex: leftHighlightIndex, insignificant: leftInsignificant }),
                      leftHighlightIndex)
                    }
                  />
                  <stop
                    offset={rightOffset}
                    stopColor={stroke(color({ highlightIndex: rightHighlightIndex, insignificant: rightInsignificant }),
                      rightHighlightIndex)}
                  />
                </linearGradient>
              </React.Fragment>
            ))
        }
      </>
    );
  }
}
