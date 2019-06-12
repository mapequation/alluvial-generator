import { cross, hsl as d3_hsl } from "d3";
import PropTypes from "prop-types";
import React from "react";


export default function LinearGradients(props) {
  const { defaultColor, highlightColors } = props;

  const highlightIndices = [-1, ...highlightColors.keys()];
  const pairs = cross(highlightIndices, highlightIndices);
  const color = index => index === -1 ? defaultColor : highlightColors[index];
  const id = (left, right) => `gradient_${left}_${right}`;
  const stroke = color => {
    const hsl = d3_hsl(color);
    hsl.s += 0.2;
    hsl.l -= 0.2;
    return hsl.toString();
  };
  const strokeId = (left, right) => `gradient-stroke_${left}_${right}`;

  const leftOffset = "15%";
  const rightOffset = "85%";

  return (
    <React.Fragment>
      {pairs.map(([left, right], key) => (
        <React.Fragment key={key}>
          <linearGradient id={id(left, right)}>
            <stop offset={leftOffset} stopColor={color(left)}/>
            <stop offset={rightOffset} stopColor={color(right)}/>
          </linearGradient>
          <linearGradient id={strokeId(left, right)}>
            <stop offset={leftOffset} stopColor={stroke(color(left))}/>
            <stop offset={rightOffset} stopColor={stroke(color(right))}/>
          </linearGradient>
        </React.Fragment>
      ))}
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
    d => `url(#gradient_${d.leftHighlightIndex}_${d.rightHighlightIndex})`
  );

LinearGradients.stroke = d =>
  d.attr(
    "stroke",
    d =>
      `url(#gradient-stroke_${d.leftHighlightIndex}_${d.rightHighlightIndex})`
  );
