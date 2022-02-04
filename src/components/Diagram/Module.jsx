import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import useOnClick from "../../hooks/useOnClick";

const Module = observer(function Module({ module, fillColor }) {
  const ref = useRef();
  const store = useContext(StoreContext);
  const controls = useAnimation();
  const { fontSize, adaptiveFontSize, showModuleId, showModuleNames } = store;
  const dropShadow = DropShadows.filter(store.dropShadow);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => store.setSelectedModule(module),
    onDoubleClick: (event) => {
      const success = event.shiftKey
        ? store.regroup(module)
        : store.expand(module);
      if (!success) {
        controls.start({
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
      <motion.g animate={controls}>
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
      </motion.g>

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
            animate={{ fontSize: actualFontSize, dy }}
            transition={transition}
            textAnchor={module.textAnchor}
            strokeWidth={0}
            fill={isSelected ? "#f00" : "#000"}
            data-x={namePosition.x}
            data-y={namePosition.y}
          >
            {module.name || module.largestLeafNodes.join(", ")}
          </motion.text>
        </motion.g>
      )}
    </motion.g>
  );
});

export default Module;
