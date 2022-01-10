import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import { StoreContext } from "../../store";
import useEventListener from "../../hooks/useEventListener";

const zoom = d3
  .zoom()
  .scaleExtent([0.1, 1000])
  .filter((event) => !event.shiftKey);

export default function ZoomableSvg({ width, height, children }) {
  const ref = useRef();
  const store = useContext(StoreContext);

  useEventListener("click", () => store.setSelectedModule(null), ref);

  useEffect(() => {
    const currentRef = ref?.current;

    d3.select(currentRef)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, d3.zoomIdentity);

    const zoomable = d3.select("#zoomable").attr("transform", d3.zoomIdentity);

    zoom.on("zoom", (event) => zoomable.attr("transform", event.transform));
  }, [ref, store]);

  return (
    <svg
      style={{ width, height }}
      ref={ref}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
    >
      <rect className="background" width="100%" height="100%" fill="#fff" />
      <g id="zoomable" children={children} />
    </svg>
  );
}
