import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import useOnClick from "../../hooks/useOnClick";
import { streamlineHorizontal } from "../../utils/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";
import ZoomableSvg from "./ZoomableSvg";
import raise from "../../utils/raise";
import { drawerWidth } from "../App";

const streamlineGenerator = streamlineHorizontal();

function translate({ width, height }) {
  let { innerWidth, innerHeight } = window;
  innerWidth -= drawerWidth;

  const dx = Math.max((innerWidth - width) / 2, 100);
  const dy = Math.max((innerHeight - height) / 3, 100);

  return `translate(${dx}, ${dy})`;
}

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const { diagram, defaultHighlightColor, highlightColors, updateFlag } = store;
  const maxDropShadowModuleLevel = 3;
  const groupFillColor = highlightColor(defaultHighlightColor, highlightColors);

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
        <g className="alluvialDiagram" transform={translate(diagram.root)}>
          {diagram.root.children.map((network) => (
            <Network
              key={network.id}
              network={network}
              groupFillColor={groupFillColor}
            />
          ))}
        </g>
      </ZoomableSvg>
    </svg>
  );
});

const Network = observer(function Network({ network, groupFillColor }) {
  const store = useContext(StoreContext);
  const { streamlineThreshold, streamlineOpacity, fontSize, showNetworkNames } =
    store;

  const children = network.visibleChildren;
  const links = network.getLinks(streamlineThreshold);

  const uniqueIndices = new Set();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  const activeIndices = Array.from(uniqueIndices, (indices) =>
    indices.split("_").map(Number)
  );

  return (
    <g className="network">
      <defs>
        <LinearGradients activeIndices={activeIndices} />
      </defs>
      {showNetworkNames && (
        <text
          className="name"
          style={{ cursor: "default" }}
          fontSize={fontSize}
          dy={3}
          textAnchor="middle"
          {...network.namePosition}
        >
          {network.name}
        </text>
      )}

      {links.map((link) => (
        <Streamline key={link.id} link={link} opacity={streamlineOpacity} />
      ))}

      {children.map((module) => (
        <Module key={module.id} module={module} fillColor={groupFillColor} />
      ))}
    </g>
  );
});

function Streamline({ link, opacity }) {
  return (
    <path
      className="streamline"
      // style={{ cursor: "pointer" }}
      fill={LinearGradients.fill(link)}
      //stroke={LinearGradients.stroke(link)}
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      paintOrder="stroke"
      opacity={opacity}
      d={streamlineGenerator(link.path)}
    />
  );
}

const Module = observer(function Module({ module, fillColor }) {
  const store = useContext(StoreContext);
  const ref = useRef();

  const { fontSize, showModuleId, showModuleNames } = store;
  const dropShadow = DropShadows.filter(store.dropShadow);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => {
      raise(ref?.current);
      store.setSelectedModule(module);
    },
    onDoubleClick: (event) => {
      if (event.shiftKey) {
        module.regroup();
      } else {
        module.expand();
      }
      if (isSelected) {
        store.setSelectedModule(null);
      }
      store.updateLayout();
    },
  });

  return (
    <g
      ref={ref}
      className="module"
      style={{
        cursor: "pointer",
        filter: dropShadow(module),
      }}
      stroke="#f00"
      strokeWidth={isSelected ? 1 : 0}
      onClick={handler}
    >
      {module.children.map((group) => (
        <rect
          key={group.id}
          className="group"
          {...group.layout}
          fill={fillColor(group)}
        />
      ))}

      {showModuleId && (
        <text
          fontSize={fontSize}
          textAnchor="middle"
          dy={3}
          stroke="#fff"
          strokeWidth={3}
          paintOrder="stroke"
          strokeLinecap="round"
          {...module.idPosition}
        >
          {module.moduleId}
        </text>
      )}

      {showModuleNames && module.textAnchor != null && (
        <text
          fontSize={fontSize}
          textAnchor={module.textAnchor}
          dy={3}
          strokeWidth={0}
          fill={isSelected ? "#f00" : "#000"}
          {...module.namePosition}
        >
          {module.largestLeafNodes.join(", ")}
        </text>
      )}
    </g>
  );
});
