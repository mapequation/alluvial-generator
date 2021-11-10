import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import { streamlineHorizontal } from "../../utils/streamline";
import DropShadows from "./DropShadows";
import LinearGradients from "./LinearGradients";
import ZoomableSvg from "./ZoomableSvg";

const streamlineGenerator = streamlineHorizontal();

export default observer(function Diagram() {
  const store = useContext(StoreContext);
  const svgRef = useRef(null);
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
      ref={svgRef}
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
              name={network.networkName}
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
  name,
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

  const activeIndices = Array.from(uniqueIndices, (i) =>
    i.split("_").map(Number)
  );

  return (
    <g className="networkRoot">
      <defs>
        <LinearGradients activeIndices={activeIndices} />
      </defs>
      {showName && (
        <NetworkName
          x={name.textX}
          y={name.textY}
          fontSize={fontSize}
          name={name.name}
        />
      )}

      {links.map((link) => (
        <Streamline key={link.id} link={link} opacity={streamlineOpacity} />
      ))}

      {children.map((module, i) => (
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

function NetworkName({ x, y, fontSize, name }) {
  return (
    <text
      className="name"
      style={{ cursor: "default" }}
      x={x}
      y={y}
      dy={3}
      textAnchor="middle"
      fontSize={fontSize}
    >
      {name}
    </text>
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

function Module({ module, dropShadow, fillColor }) {
  return (
    <g
      className="module"
      style={{
        cursor: "pointer",
        filter: dropShadow(module),
      }}
      stroke="#f00"
      strokeOpacity={0}
    >
      {module.children.map((group) => (
        <Group key={group.id} fill={fillColor(group)} {...group} />
      ))}
    </g>
  );
}

function Group({ x, y, width, height, fill }) {
  return (
    <rect
      className="group"
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
    />
  );
}
