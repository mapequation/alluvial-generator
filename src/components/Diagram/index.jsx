import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
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
          x={network.nameX}
          y={network.nameY}
          fontSize={fontSize}
          dy={3}
          textAnchor="middle"
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

let clickTimer;

function Module({ module, dropShadow, fillColor }) {
  const store = useContext(StoreContext);

  const onClick = () => store.setSelectedModule(module);

  const onDoubleClick = (event) => {
    if (event.shiftKey) {
      module.regroup();
    } else {
      module.expand();
    }
    store.updateLayout();
  };

  const nodes = module.largestLeafNodes; // eslint-disable-line no-unused-vars

  const onClickHandler = (e) => {
    clearTimeout(clickTimer);
    if (e.detail === 1) {
      clickTimer = setTimeout(onClick(e), 250);
    } else if (e.detail === 2) {
      onDoubleClick(e);
    }
  };

  return (
    <g
      className="module"
      style={{
        cursor: "pointer",
        filter: dropShadow(module),
      }}
      stroke="#f00"
      strokeOpacity={0}
      onClick={onClickHandler}
    >
      {module.children.map((group) => (
        <rect
          key={group.id}
          className="group"
          x={group.x}
          y={group.y}
          width={group.width}
          height={group.height}
          fill={fillColor(group)}
        />
      ))}
    </g>
  );
}
