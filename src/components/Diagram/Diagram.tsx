import * as d3 from "d3";
import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useContext, useEffect, useRef } from "react";
import type { Module } from "../../alluvial";
import useEventListener from "../../hooks/useEventListener";
import useWindowSize from "../../hooks/useWindowSize";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import { drawerWidth } from "../App";
import "./Diagram.css";
import DropShadows from "./DropShadows";
import Network from "./Network";

const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 1000]);

export default observer(function Diagram() {
  const ref = useRef<SVGSVGElement>(null);
  const { width, height } = useWindowSize();
  const store = useContext(StoreContext);
  const { diagram, defaultHighlightColor, highlightColors, updateFlag } = store;
  const fillColor = highlightColor(defaultHighlightColor, highlightColors);

  useEventListener("click", () => store.setSelectedModule(null), ref);

  useEffect(() => {
    const currentRef = ref?.current;
    if (!currentRef) return;

    d3.select(currentRef).call(zoom).on("dblclick.zoom", null);

    const zoomable = currentRef?.getElementById("zoomable");

    zoom.on("zoom", (event) =>
      zoomable?.setAttribute("transform", event.transform)
    );
  }, [ref, store]);

  useEventListener("keydown", (event) => {
    if (store.editMode) return;

    // @ts-ignore
    const key = event?.key;

    if (key === "w") {
      store.moveSelectedModule("up");
    } else if (key === "s") {
      store.moveSelectedModule("down");
    } else if (key === "a") {
      store.moveNetwork("left");
    } else if (key === "d") {
      store.moveNetwork("right");
    } else if (key === "e" && store.selectedModule != null) {
      store.expand(store.selectedModule);
    } else if (key === "c" && store.selectedModule != null) {
      store.regroup(store.selectedModule);
    } else if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)
    ) {
      event.preventDefault();

      const direction = key.replace("Arrow", "").toLowerCase() ?? "";
      store.selectModule(direction);
    }
  });

  const maxDropShadowModuleLevel = 3;

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id="alluvialSvg"
      className={`updateFlag-${updateFlag}`}
      data-width={diagram.width}
      data-height={diagram.height}
    >
      <defs>
        <DropShadows maxLevel={maxDropShadowModuleLevel} />
      </defs>
      <rect className="background" width={width} height={height} fill="#fff" />
      <g id="zoomable">
        <motion.g
          id="translate-center"
          initial={false}
          animate={translateCenter(diagram)}
          transition={{ duration: 0.2, bounce: 0 }}
        >
          {diagram.children.map((network) => (
            <Network key={network.id} network={network} fillColor={fillColor} />
          ))}
          <SelectedModule module={store.selectedModule} />
        </motion.g>
      </g>
    </svg>
  );
});

function SelectedModule({ module }: { module: Module | null }) {
  if (module == null) {
    return null;
  }

  return (
    <motion.rect
      initial={false}
      animate={module.layout}
      transition={{ bounce: 0, duration: 0.2 }}
      stroke="#f00"
      strokeWidth="1"
      pointerEvents="none"
      fill="none"
    />
  );
}

function translateCenter({ width, height }: { width: number; height: number }) {
  let { innerWidth, innerHeight } = window;
  innerWidth -= drawerWidth;

  const x = Math.max((innerWidth - width) / 2, 100);
  const y = Math.max((innerHeight - height) / 3, 100);

  return { x, y };
}
