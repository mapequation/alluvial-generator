import { motion, MotionProps, useAnimation } from "framer-motion";
import { observer } from "mobx-react";
import { useContext } from "react";
import type { Module as ModuleType } from "../../alluvial";
import useOnClick from "../../hooks/useOnClick";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import DropShadows from "./DropShadows";
import Tooltip from "./Tooltip";

type FillColor = (_: {
  highlightIndex: number;
  insignificant: boolean;
}) => string;

export type ModuleProps = {
  module: ModuleType;
  fillColor: FillColor;
} & MotionProps;

const Module = observer(function Module({
  module,
  fillColor,
  transition,
}: ModuleProps) {
  const store = useContext(StoreContext);
  const controls = useAnimation();
  const {
    fontSize,
    adaptiveFontSize,
    showModuleId,
    showModuleNames,
    multilineModuleNames,
  } = store;
  const dropShadow = DropShadows.filter(store.dropShadow);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => store.setSelectedModule(module),
    onDoubleClick: (event) => {
      const success = event.shiftKey
        ? store.regroup(module)
        : store.expand(module);
      if (!success) {
        void controls.start({
          x: [null, 5, -5, 4, -4, 0],
          scale: [null, 1.01, 1],
          opacity: [1, 0.8, 1, 0.8, 1],
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.5,
          },
        });
      }
    },
  });

  // Rounding because fractional font sizes causes Google Chrome
  // to stutter when zooming.
  const baseFontSize = 1;
  const adaptive = baseFontSize + Math.round(Math.min(fontSize, module.height));

  const actualFontSize = adaptiveFontSize ? adaptive : fontSize;
  const dy = actualFontSize / 3;
  const strokeWidth = Math.max(actualFontSize / 5, 1);

  const { idPosition, namePosition } = module;

  const textFill = highlightColor("#000", store.highlightColors);

  return (
    <g className="module" onClick={handler}>
      <Tooltip module={module} fillColor={fillColor}>
        <motion.g animate={controls}>
          <g
            // move this to the parent g when/if framer motion supports css filter
            style={{ filter: dropShadow(module) }}
          >
            {module.children.map((group) => (
              <motion.rect
                key={group.id}
                className="group"
                initial={false}
                animate={group.layout}
                transition={transition}
                fill={fillColor(group)}
                data-x={group.x}
                data-y={group.y}
              />
            ))}
          </g>
        </motion.g>
      </Tooltip>

      {showModuleId && (
        <motion.g
          className="label"
          initial={false}
          animate={idPosition}
          transition={transition}
        >
          <motion.text
            animate={{ fontSize: actualFontSize, dy }}
            transition={transition}
            textAnchor="middle"
            fontWeight={600}
            stroke="hsla(0, 0%, 100%, 0.8)"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            paintOrder="stroke"
            strokeLinecap="round"
            data-x={idPosition.x}
            data-y={idPosition.y}
          >
            {module.moduleId}
          </motion.text>
        </motion.g>
      )}

      {showModuleNames && module.textAnchor != null && (
        <motion.g
          className="label"
          initial={false}
          animate={namePosition}
          transition={transition}
        >
          <motion.text
            animate={{ fontSize: actualFontSize }}
            transition={transition}
            textAnchor={module.textAnchor}
            strokeWidth={0}
            fill={isSelected ? "#f00" : "#000"}
            data-x={namePosition.x}
            data-y={namePosition.y}
            dominantBaseline="middle"
          >
            {module.name || (
              <LargestLeafNames
                module={module}
                fontSize={actualFontSize}
                aggregateStates={store.aggregateStateNames}
                multiLine={multilineModuleNames}
                fillColor={textFill}
              />
            )}
          </motion.text>
        </motion.g>
      )}
    </g>
  );
});

function LargestLeafNames({
  module,
  fontSize,
  aggregateStates,
  multiLine,
  fillColor,
}: {
  module: ModuleType;
  fontSize: number;
  aggregateStates: boolean;
  multiLine: boolean;
  fillColor: FillColor;
}) {
  if (!multiLine) {
    return (
      <>
        {module
          .getLargestLeafNodes(5, aggregateStates)
          .map((node) => node.name)
          .join(", ")}
      </>
    );
  }
  // Current y is at y + height / 2
  // We want to center the middle line at this y.
  // Furthermore, we don't want to show more lines than can
  // fit in the module height.
  const heightPerLine = fontSize * 1.8;
  let maxLines = Math.ceil(module.height / heightPerLine);

  if (maxLines === 0) {
    // Shouldn't happen, but just in case
    return null;
  }

  if (maxLines % 2 === 0) {
    // Easier to center the middle line if it's odd
    maxLines--;
  }

  const names = module.getLargestLeafNodes(maxLines, aggregateStates);
  const mid = Math.ceil(names.length / 2);

  // "Middle out!"
  // https://youtu.be/Ex1JuIN0eaA
  return (
    <>
      {names
        .slice(0, mid)
        .reverse()
        .map((node, i) => (
          <tspan
            key={aggregateStates ? node.nodeId : node.stateId}
            x={0}
            dy={i === 0 ? 0 : "-1.2em"}
            fill={fillColor(node)}
          >
            {node.name}
          </tspan>
        ))}
      {names.slice(mid).map((node, i) => (
        <tspan
          key={aggregateStates ? node.nodeId : node.stateId}
          x={0}
          dy={i === 0 ? `${mid * 1.2}em` : "1.2em"}
          fill={fillColor(node)}
        >
          {node.name}
        </tspan>
      ))}
    </>
  );
}

export default Module;
