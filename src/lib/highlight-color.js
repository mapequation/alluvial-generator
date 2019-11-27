import * as d3 from "d3";


const highlightColor = (defaultHighlightColor, highlightColors) => ({ highlightIndex, insignificant }) => {
  const color = highlightIndex === -1
    ? defaultHighlightColor
    : highlightColors[highlightIndex];

  if (insignificant) {
    return d3.hsl(color).brighter(0.5).toString();
  }

  return color;
};

export default highlightColor;
