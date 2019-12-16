import * as d3 from "d3";
import { NOT_HIGHLIGHTED } from "../alluvial/HighlightGroup";


const highlightColor = (defaultHighlightColor, highlightColors) => ({ highlightIndex, insignificant }) => {
  const color = highlightIndex === NOT_HIGHLIGHTED
    ? defaultHighlightColor
    : highlightColors[highlightIndex];

  if (insignificant) {
    return d3.hsl(color).brighter(0.5).toString();
  }

  return color;
};

export default highlightColor;
