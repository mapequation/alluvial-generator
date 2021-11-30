import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import useOnClick from "../../utils/onClick";
import { streamlineHorizontal } from "../../utils/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";
import ZoomableSvg from "./ZoomableSvg";

const streamlineGenerator = streamlineHorizontal();

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const {
    diagram,
    defaultHighlightColor,
    highlightColors,
    streamlineThreshold,
    streamlineOpacity,
    dropShadow,
    fontSize,
    showNetworkNames,
    updateFlag,
  } = store;
  const maxModuleLevel = 3;
  const groupFillColor = highlightColor(defaultHighlightColor, highlightColors);
  const dropShadowFilter = DropShadows.filter(dropShadow);

  return (
    <svg
      style={{ width: "100vw", height: "100vh" }}
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      id="alluvialSvg"
      className={`updateFlag-${updateFlag}`}
    >
      <defs>
        <DropShadows maxLevel={maxModuleLevel} />
      </defs>
      <ZoomableSvg>
        <g className="alluvialDiagram" transform="translate(200, 10)">
          {diagram.alluvialRoot.children.map((network) => (
            <Network
              key={network.id}
              network={network}
              showName={showNetworkNames}
              fontSize={fontSize}
              streamlineOpacity={streamlineOpacity}
              streamlineThreshold={streamlineThreshold}
              dropShadow={dropShadowFilter}
              groupFillColor={groupFillColor}
            />
          ))}
        </g>
      </ZoomableSvg>
    </svg>
  );
});

function Network({
  network,
  fontSize,
  showName,
  streamlineOpacity,
  streamlineThreshold,
  dropShadow,
  groupFillColor,
}) {
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
    <g className="networkRoot">
      <defs>
        <LinearGradients activeIndices={activeIndices} />
      </defs>
      {showName && (
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
        <Module
          key={module.id}
          module={module}
          dropShadow={dropShadow}
          fillColor={groupFillColor}
        />
      ))}
    </g>
  );
}

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

const Module = observer(function Module({ module, dropShadow, fillColor }) {
  const store = useContext(StoreContext);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => store.setSelectedModule(module),
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
    delay: 100,
  });

  return (
    <g
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

      {store.showModuleId && (
        <text
          fontSize={store.fontSize}
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

      {store.showModuleNames && module.textAnchor != null && (
        <text
          fontSize={store.fontSize}
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
