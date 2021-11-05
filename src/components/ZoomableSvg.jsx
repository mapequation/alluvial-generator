import { useEffect, useRef } from "react";
import * as d3 from "d3";

const zoom = d3.zoom().scaleExtent([0.1, 1000]);
const initialTransform = d3.zoomIdentity.translate(0, 50);

export default function ZoomableSvg({
  width = "100vw",
  height = "100vh",
  onClick = () => null,
  children,
}) {
  const node = useRef(null);

  useEffect(() => {
    const svg = d3
      .select(node.current)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, initialTransform);

    const zoomable = svg
      .select("#zoomable")
      .attr("transform", initialTransform);

    zoom.on("zoom", () => zoomable.attr("transform", d3.event.transform));

    svg.select(".background").on("click", onClick);
  }, [onClick]);

  return (
    <svg
      style={{ width, height }}
      ref={node}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
    >
      <rect className="background" width="100%" height="100%" fill="#fff" />
      <g id="zoomable" children={children} />
    </svg>
  );
}
