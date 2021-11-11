import * as d3 from "d3";
import { useEffect, useRef } from "react";

const zoom = d3.zoom().scaleExtent([0.1, 1000]);
const initialTransform = d3.zoomIdentity.translate(0, 50);
const nop = () => null;

export default function ZoomableSvg({
  width,
  height,
  children,
  onClick = nop,
}) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = d3.select("#zoomable").attr("transform", initialTransform);

    zoom.on("zoom", (event) => zoomable.attr("transform", event.transform));

    svg.select(".background").on("click", onClick);
  }, [svgRef, onClick]);

  return (
    <svg
      style={{ width, height }}
      ref={svgRef}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
    >
      <rect className="background" width="100%" height="100%" fill="#fff" />
      <g id="zoomable" children={children} />
    </svg>
  );
}
