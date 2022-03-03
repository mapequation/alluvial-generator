import * as d3 from "d3";
import { NOT_HIGHLIGHTED } from "../alluvial";

type Color = {
  highlightIndex: number;
  insignificant: boolean;
};

export default function highlightColor(
  defaultHighlightColor: string,
  highlightColors: string[]
) {
  return ({ highlightIndex, insignificant }: Color) => {
    const color =
      highlightIndex === NOT_HIGHLIGHTED
        ? defaultHighlightColor
        : highlightColors[highlightIndex];

    if (insignificant) {
      return d3.hsl(color).brighter(0.8).toString();
    }

    return color;
  };
}
