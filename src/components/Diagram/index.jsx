import * as d3 from "d3";
import { motion, useMotionValue } from "framer-motion";
import { observer } from "mobx-react";
import { useContext, useRef, useState, useEffect } from "react";
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
      <ZoomableSvg>
        <g className="alluvialDiagram" transform="translate(200, 10)">
          {diagram.alluvialRoot.children.map((network) => (
            <g className="networkRoot" key={network.id}>
              {showNetworkNames && (
                <NetworkName
                  x={network.networkName.textX}
                  y={network.networkName.textY}
                  fontSize={fontSize}
                  name={network.networkName.name}
                />
              )}

              {network.links
                .filter((link) => link.avgHeight > streamlineThreshold)
                .sort((a, b) =>
                  a.highlightIndex !== b.highlightIndex
                    ? a.highlightIndex - b.highlightIndex
                    : b.avgHeight - a.avgHeight
                )
                .map((link) => (
                  <Streamline key={link.id} link={link} />
                ))}

              {network.visibleChildren.map((module, i) => (
                <Module
                  key={module.id}
                  module={module}
                  dropShadow={dropShadowFilter}
                  fillColor={groupFillColor}
                  setPosition={(i, pos) => console.log("setPosition", i, pos)}
                  moveItem={(i, pos) => console.log("moveItem", i, pos)}
                  i={i}
                />
              ))}
            </g>
          ))}
        </g>
      </ZoomableSvg>
    </svg>
  );
});

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

function Module({ module, dropShadow, fillColor, setPosition, moveItem, i }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOriginY = useMotionValue(0);

  useEffect(() => {
    // console.log(ref.current);
    // setPosition(i, {
    //   height: ref.current.offsetHeight,
    //   top: ref.current.offsetTop,
    // });
  });

  return (
    <motion.g
      ref={ref}
      className="module"
      style={{
        cursor: "pointer",
        filter: dropShadow(module),
      }}
      stroke="#f00"
      strokeOpacity={0}
      // motion
      initial={false}
      animate={
        isDragging ? { zIndex: 1 } : { zIndex: 0, transition: { delay: 0.3 } }
      }
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 1.1 }}
      drag="y"
      //dragOriginY={dragOriginY}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={1}
      onDragStart={(e) => {
        return setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onDrag={(e, { point }) => {
        console.log(e);
        return moveItem(i, point.y);
      }}
      positionTransition={({ delta }) => {
        if (isDragging) {
          dragOriginY.set(dragOriginY.get() + delta.y);
        }

        return !isDragging;
      }}
    >
      {module.children.map((group) => (
        <Group key={group.id} fill={fillColor(group)} {...group} />
      ))}
    </motion.g>
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
