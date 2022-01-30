import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { motion } from "framer-motion";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import useOnClick from "../../hooks/useOnClick";

const Module = observer(function Module({ module, fillColor }) {
  const ref = useRef();
  const store = useContext(StoreContext);
  const { fontSize, adaptiveFontSize, showModuleId, showModuleNames } = store;
  const dropShadow = DropShadows.filter(store.dropShadow);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => store.setSelectedModule(module),
    onDoubleClick: (event) => {
      if (event.shiftKey) {
        store.regroup(module);
      } else {
        store.expand(module);
      }
    },
  });

  const transition = { bounce: 0, duration: 0.2 };

  // Rounding because fractional font sizes causes Google Chrome
  // to stutter when zooming.
  const baseFontSize = 1;
  const adaptive = baseFontSize + Math.round(Math.min(fontSize, module.height));

  const actualFontSize = adaptiveFontSize ? adaptive : fontSize;
  const dy = actualFontSize / 3;
  const strokeWidth = Math.max(actualFontSize / 5, 1);

  const { idPosition, namePosition } = module;

  return (
    <motion.g
      ref={ref}
      className="module"
      onClick={handler}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
    >
      <g style={{ filter: dropShadow(module) }}>
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

      {showModuleId && (
        <motion.g
          className="label"
          initial={false}
          animate={idPosition}
          transition={transition}
        >
          <text
            fontSize={actualFontSize}
            textAnchor="middle"
            dy={dy}
            stroke="hsla(0, 0%, 100%, 0.6)"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            paintOrder="stroke"
            strokeLinecap="round"
            data-x={idPosition.x}
            data-y={idPosition.y}
          >
            {module.moduleId}
          </text>
        </motion.g>
      )}

      {showModuleNames && module.textAnchor != null && (
        <motion.g
          className="label"
          initial={false}
          animate={namePosition}
          transition={transition}
        >
          <text
            fontSize={actualFontSize}
            textAnchor={module.textAnchor}
            dy={dy}
            strokeWidth={0}
            fill={isSelected ? "#f00" : "#000"}
            data-x={namePosition.x}
            data-y={namePosition.y}
          >
            {module.name || module.largestLeafNodes.join(", ")}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
});

export default Module;

export function SelectedModule({ module }) {
  if (module == null) {
    return null;
  }

  return (
    <motion.rect
      initial={false}
      animate={module.layout}
      transition={{ bounce: 0, duration: 0.2 }}
      stroke="#f00"
      strokeWidth="1"
      pointerEvents="none"
      fill="none"
    />
  );
}
