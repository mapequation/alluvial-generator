import { motion, MotionProps } from "framer-motion";
import { observer } from "mobx-react";
import { SVGProps, useContext } from "react";
import type {
  HighlightGroup,
  Module as ModuleType,
  Network as NetworkType,
} from "../../alluvial";
import { StreamlineLink } from "../../alluvial";
import { HierarchicalModule } from "../../alluvial/Network";
import { StoreContext } from "../../store";
import LinearGradients from "./LinearGradients";
import Module from "./Module";
import Streamline from "./Streamline";

const Network = observer(function Network({
  network,
  fillColor,
}: {
  network: NetworkType;
  fillColor: (_: HighlightGroup) => string;
}) {
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
          const m = module as ModuleType;
          return <Module key={m.id} module={m} fillColor={fillColor} />;
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

function OutlineModule({
  module,
  transition,
  stroke,
}: { module: HierarchicalModule } & MotionProps & SVGProps<SVGRectElement>) {
  let { x, y, width, height, maxModuleLevel, moduleLevel } = module;
  const offset = 1 + 2.5 * (maxModuleLevel - moduleLevel);

  x -= offset;
  y -= offset;
  width += 2 * offset;
  height += 2 * offset;

  return (
    <motion.rect
      className="super-module"
      id={module.path.toString()}
      initial={{ ...module.layout, opacity: 0 }}
      animate={{ x, y, width, height, opacity: 1 }}
      exit={{ ...module.layout, opacity: 0 }}
      transition={transition}
      data-x={x}
      data-y={y}
      rx={offset}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeDasharray="1,4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function ShadowModule({
  module,
  transition,
  fill,
}: {
  module: HierarchicalModule;
} & MotionProps &
  SVGProps<SVGRectElement>) {
  const offset = 5 * (module.maxModuleLevel - module.moduleLevel);
  const { layout } = module;

  return (
    <g style={{ isolation: "isolate", mixBlendMode: "difference" }}>
      <motion.g
        className="super-module-offset"
        initial={{ x: 0, y: 0 }}
        animate={{ x: offset, y: offset }}
        exit={{ x: 0, y: 0 }}
        data-x={offset}
        data-y={offset}
        transition={transition}
      >
        <motion.rect
          className="super-module"
          id={module.path.toString()}
          initial={{ ...layout, opacity: 0 }}
          animate={{ ...layout, opacity: 0.3 }}
          exit={{ ...layout, opacity: 0 }}
          transition={transition}
          data-x={layout.x}
          data-y={layout.y}
          fill={fill}
        />
      </motion.g>
    </g>
  );
}

function activeHighlightIndices(links: Iterable<StreamlineLink>) {
  const uniqueIndices = new Set<string>();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  return Array.from(uniqueIndices, (indices) => indices.split("_").map(Number));
}

export default Network;
