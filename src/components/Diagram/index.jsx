import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext } from "react";
import { LayoutGroup } from "framer-motion";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import DropShadows from "./DropShadows";
import ZoomableSvg from "./ZoomableSvg";
import translateCenter from "./translate-center";
import "./Diagram.css";
import Network from "./Network";
import useEventListener from "../../hooks/useEventListener";
import { SelectedModule } from "./Module";
import useWindowSize from "../../hooks/useWindowSize";

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const { width, height } = useWindowSize();
  const { diagram, defaultHighlightColor, highlightColors, updateFlag } = store;
  const maxDropShadowModuleLevel = 3;
  const groupFillColor = highlightColor(defaultHighlightColor, highlightColors);

  useEventListener("keydown", (event) => {
    if (store.editMode) return;

    if (event?.key === "w") {
      store.moveSelectedModule("up");
    } else if (event?.key === "s") {
      store.moveSelectedModule("down");
    } else if (event?.key === "e" && store.selectedModule != null) {
      store.expand(store.selectedModule);
    } else if (event?.key === "d" && store.selectedModule != null) {
      store.regroup(store.selectedModule);
    } else if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event?.key)
    ) {
      event.preventDefault();

      const direction = event?.key.replace("Arrow", "").toLowerCase() ?? "";
      store.selectModule(direction);
    }
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id="alluvialSvg"
      className={`updateFlag-${updateFlag}`}
    >
      <defs>
        <DropShadows maxLevel={maxDropShadowModuleLevel} />
      </defs>
      <ZoomableSvg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <g transform={translateCenter(diagram)}>
          <LayoutGroup>
            {diagram.children.map((network) => (
              <Network
                key={network.id}
                network={network}
                groupFillColor={groupFillColor}
              />
            ))}
            <SelectedModule module={store.selectedModule} />
          </LayoutGroup>
        </g>
      </ZoomableSvg>
    </svg>
  );
});
