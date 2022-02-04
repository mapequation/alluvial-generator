import { observer } from "mobx-react";
import { useContext } from "react";
import { motion } from "framer-motion";
import { StoreContext } from "../../store";
import LinearGradients from "./LinearGradients";
import Streamline from "./Streamline";
import Module from "./Module";

const Network = observer(function Network({ network, fillColor }) {
  const {
    defaultHighlightColor,
    streamlineThreshold,
    streamlineOpacity,
    networkFontSize,
    showNetworkNames,
    hierarchicalModules,
  } = useContext(StoreContext);

  const links = network.getLinks(streamlineThreshold);
  const { namePosition } = network;

  const modules =
    hierarchicalModules === "none"
      ? network.visibleChildren
      : network.hierarchicalChildren;

  const transition = { bounce: 0, duration: 0.2 };

  return (
    <g className="network">
      <defs>
        <LinearGradients activeIndices={activeHighlightIndices(links)} />
      </defs>
      {showNetworkNames && (
        <motion.g
          className="label"
          initial={false}
          animate={namePosition}
          transition={transition}
        >
          <motion.text
            className="name"
            animate={{ fontSize: networkFontSize, dy: networkFontSize }}
            transition={transition}
            textAnchor="middle"
            data-x={namePosition.x}
            data-y={namePosition.y}
          >
            {network.name}
          </motion.text>
        </motion.g>
      )}

      {modules.map((module) => {
        if (hierarchicalModules === "none" || !("isLeaf" in module)) {
          return (
            <Module key={module.id} module={module} fillColor={fillColor} />
          );
        } else if (hierarchicalModules === "shadow") {
          return (
            <ShadowModule
              key={module.path.toString()}
              module={module}
              transition={transition}
              fill={defaultHighlightColor}
            />
          );
        } else {
          return (
            <OutlineModule
              key={module.path.toString()}
              module={module}
              transition={transition}
              stroke={defaultHighlightColor}
            />
          );
        }
      })}

      {links.map((link) => (
        <Streamline key={link.id} link={link} opacity={streamlineOpacity} />
      ))}
    </g>
  );
});

function OutlineModule({ module, transition, stroke }) {
  let { x, y, width, height, maxModuleLevel, moduleLevel } = module;
  const offset = 1 + 2.5 * (maxModuleLevel - moduleLevel);

  x -= offset;
  y -= offset;
  width += 2 * offset;
  height += 2 * offset;

  return (
    <motion.rect
      id={module.path.toString()}
      initial={{ ...module.layout, opacity: 0 }}
      animate={{ x, y, width, height, opacity: 1 }}
      exit={{ ...module.layout, opacity: 0 }}
      rx={offset}
      transition={transition}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeDasharray="1,4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ShadowModule({ module, transition, fill }) {
  const offset = 5 * (module.maxModuleLevel - module.moduleLevel);
  const { layout } = module;

  return (
    <g style={{ isolation: "isolate", mixBlendMode: "difference" }}>
      <motion.g
        initial={{ x: 0, y: 0 }}
        animate={{ x: offset, y: offset }}
        exit={{ x: 0, y: 0 }}
        transition={transition}
      >
        <motion.rect
          id={module.path.toString()}
          initial={{ ...layout, opacity: 0 }}
          animate={{ ...layout, opacity: 0.3 }}
          exit={{ ...layout, opacity: 0 }}
          transition={transition}
          fill={fill}
        />
      </motion.g>
    </g>
  );
}

function activeHighlightIndices(links) {
  const uniqueIndices = new Set();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  return Array.from(uniqueIndices, (indices) => indices.split("_").map(Number));
}

export default Network;
