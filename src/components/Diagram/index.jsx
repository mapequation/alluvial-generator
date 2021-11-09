import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";
import ZoomableSvg from "./ZoomableSvg";

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const svgRef = useRef(null);
  const { defaultHighlightColor, highlightColors } = store;
  const maxModuleLevel = 3;

  return (
    <svg
      style={{ width: "100vw", height: "100vh" }}
      ref={svgRef}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id="alluvialSvg"
    >
      <defs>
        <DropShadows maxLevel={maxModuleLevel} />
        <LinearGradients
          defaultColor={defaultHighlightColor}
          highlightColors={highlightColors}
        />
      </defs>
      <ZoomableSvg onClick={() => {}}>
        <g className="alluvialDiagram" />
      </ZoomableSvg>
    </svg>
  );
});
