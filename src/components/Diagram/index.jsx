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
    >
      <defs>
        <DropShadows maxLevel={maxModuleLevel} />
        <LinearGradients />
      </defs>
      <ZoomableSvg onClick={() => {}}>
        <g className="alluvialDiagram" transform="translate(200, 10)">
          {diagram.alluvialRoot.children.map((network) => (
            <g className="networkRoot" key={network.id}>
              {showNetworkNames && (
                <text
                  className="name"
                  style={{ cursor: "default" }}
                  x={network.networkName.textX}
                  y={network.networkName.textY}
                  dy={3}
                  textAnchor="middle"
                  fontSize={fontSize}
                >
                  {network.networkName.name}
                </text>
              )}

              {network.links
                .filter((link) => link.avgHeight > streamlineThreshold)
                .sort((a, b) =>
                  a.highlightIndex !== b.highlightIndex
                    ? a.highlightIndex - b.highlightIndex
                    : b.avgHeight - a.avgHeight
                )
                .map((link) => (
                  <path
                    className="streamline"
                    key={link.id}
                    // style={{ cursor: "pointer" }}
                    fill={LinearGradients.fill(link)}
                    //stroke={LinearGradients.stroke(link)}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    paintOrder="stroke"
                    opacity={streamlineOpacity}
                    d={streamlineGenerator(link.path)}
                  />
                ))}

              {network.visibleChildren.map((module) => (
                <g
                  className="module"
                  key={module.id}
                  style={{
                    cursor: "pointer",
                    filter: dropShadowFilter(module),
                  }}
                  stroke="#f00"
                  strokeOpacity={0}
                >
                  {module.children.map((group) => (
                    <g className="group" key={group.id}>
                      <rect
                        x={group.x}
                        y={group.y}
                        width={group.width}
                        height={group.height}
                        fill={groupFillColor(group)}
                      ></rect>
                    </g>
                  ))}
                </g>
              ))}
            </g>
          ))}
        </g>
      </ZoomableSvg>
    </svg>
  );
});
