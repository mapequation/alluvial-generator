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

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const { diagram, defaultHighlightColor, highlightColors, updateFlag } = store;
  const maxDropShadowModuleLevel = 3;
  const groupFillColor = highlightColor(defaultHighlightColor, highlightColors);

  useEventListener("keydown", (event) => {
    if (event?.key === "w") {
      store.moveSelectedModule("up");
    } else if (event?.key === "s") {
      store.moveSelectedModule("down");
    }
  });

  return (
    <svg
      style={{ width: "100vw", height: "100vh" }}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id="alluvialSvg"
      className={`updateFlag-${updateFlag}`}
    >
      <defs>
        <DropShadows maxLevel={maxDropShadowModuleLevel} />
      </defs>
      <ZoomableSvg>
        <g transform={translateCenter(diagram.root)}>
          <LayoutGroup>
            {diagram.root.children.map((network) => (
              <Network
                key={network.id}
                network={network}
                groupFillColor={groupFillColor}
              />
            ))}
          </LayoutGroup>
        </g>
      </ZoomableSvg>
    </svg>
  );
});
