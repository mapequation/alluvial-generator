import { cross, hsl as d3_hsl } from "d3";
import PropTypes from "prop-types";
import React from "react";
import { NOT_HIGHLIGHTED } from "../alluvial/HighlightGroup";
import highlightColor from "../lib/highlight-color";


const id = (left, right, leftInsignificant, rightInsignificant) =>
  `gradient_${left}${leftInsignificant ? "i" : ""}_${right}${rightInsignificant ? "i" : ""}`;

const strokeId = (left, right) => `gradient-stroke_${left}_${right}`;

export default function LinearGradients(props) {
  const { defaultColor, highlightColors } = props;

  const highlightIndices = [NOT_HIGHLIGHTED, ...highlightColors.keys()];
  const pairs = cross(highlightIndices, highlightIndices);
  const color = highlightColor(defaultColor, highlightColors);

  const stroke = (color, highlightIndex) => {
    if (highlightIndex === NOT_HIGHLIGHTED) {
      return "#fff";
    }

    const hsl = d3_hsl(color);
    hsl.s += 0.2;
    hsl.l -= 0.2;
    return hsl.toString();
  };

  const leftOffset = "15%";
  const rightOffset = "85%";

  return (
    <React.Fragment>
      {
        [true, false].map((leftInsignificant, l_key) =>
          [true, false].map((rightInsignificant, r_key) =>
            pairs.map(([leftHighlightIndex, rightHighlightIndex], key) => (
              <React.Fragment key={`${key}_${l_key}_${r_key}}`}>
                <linearGradient id={id(leftHighlightIndex, rightHighlightIndex, leftInsignificant, rightInsignificant)}>
                  <stop offset={leftOffset}
                        stopColor={color({ highlightIndex: leftHighlightIndex, insignificant: leftInsignificant })}/>
                  <stop offset={rightOffset}
                        stopColor={color({ highlightIndex: rightHighlightIndex, insignificant: rightInsignificant })}/>
                </linearGradient>
                <linearGradient id={strokeId(leftHighlightIndex, rightHighlightIndex)}>
                  <stop offset={leftOffset}
                        stopColor={stroke(color({ highlightIndex: leftHighlightIndex, insignificant: leftInsignificant }), leftHighlightIndex)}/>
                  <stop offset={rightOffset}
                        stopColor={stroke(color({ highlightIndex: rightHighlightIndex, insignificant: rightInsignificant }), rightHighlightIndex)}/>
                </linearGradient>
              </React.Fragment>
            ))))
      }
    </React.Fragment>
  );
}

LinearGradients.defaultProps = {
  defaultColor: "white",
  highlightColors: []
};

LinearGradients.propTypes = {
  defaultColor: PropTypes.string,
  highlightColors: PropTypes.arrayOf(PropTypes.string)
};

LinearGradients.fill = d =>
  d.attr(
    "fill",
    d => `url(#${id(d.leftHighlightIndex, d.rightHighlightIndex, d.leftInsignificant, d.rightInsignificant)})`
  );

LinearGradients.stroke = d =>
  d.attr(
    "stroke",
    d =>
      `url(#${strokeId(d.leftHighlightIndex, d.rightHighlightIndex)})`
  );
