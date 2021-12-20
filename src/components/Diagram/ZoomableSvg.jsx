import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import { StoreContext } from "../../store";

const zoom = d3
  .zoom()
  .scaleExtent([0.1, 1000])
  .filter((event) => !event.shiftKey);

export default function ZoomableSvg({ width, height, children }) {
  const ref = useRef();
  const store = useContext(StoreContext);

  useEffect(() => {
    const currentRef = ref?.current;

    const onKeyDown = (event) => {
      if (event.key === "Shift") {
        currentRef?.classList.add("drag-mode");
      }
    };
    const onKeyUp = (event) => {
      if (event.key === "Shift") {
        currentRef?.classList.remove("drag-mode");
      }
    };
    const onBackgroundClick = (event) => {
      if (event.target.parentElement === currentRef) {
        store.setSelectedModule(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    currentRef?.addEventListener("click", onBackgroundClick);

    d3.select(ref.current)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, d3.zoomIdentity);

    const zoomable = d3.select("#zoomable").attr("transform", d3.zoomIdentity);

    zoom.on("zoom", (event) => zoomable.attr("transform", event.transform));

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      currentRef?.removeEventListener("click", onBackgroundClick);
    };
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
