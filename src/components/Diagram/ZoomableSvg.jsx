import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import { StoreContext } from "../../store";

const zoom = d3.zoom().scaleExtent([0.1, 1000]);

export default function ZoomableSvg({ width, height, children }) {
  const svgRef = useRef();
  const store = useContext(StoreContext);

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .call(zoom, { capture: true })
      .on("dblclick.zoom", null)
      .call(zoom.transform, d3.zoomIdentity);

    const zoomable = d3.select("#zoomable").attr("transform", d3.zoomIdentity);

    zoom.on("zoom", (event) => zoomable.attr("transform", event.transform));

    svg.select(".background").on("click", () => store.setSelectedModule(null));
  }, [svgRef, store]);

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
