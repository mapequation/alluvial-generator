import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { motion } from "framer-motion";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import useOnClick from "../../hooks/useOnClick";

const Module = observer(function Module({ module, fillColor }) {
  const ref = useRef();
  const store = useContext(StoreContext);
  const { fontSize, showModuleId, showModuleNames } = store;
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

  const baseFontSize = 1;

  // Rounding because fractional font sizes causes Google Chrome
  // to stutter when zooming.
  const adaptiveFontSize = Math.round(
    baseFontSize + Math.min(fontSize, module.height)
  );

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
          />
        ))}
      </g>

      {showModuleId && (
        <motion.text
          fontSize={adaptiveFontSize}
          textAnchor="middle"
          dy={adaptiveFontSize / 3}
          stroke="hsla(0, 0%, 100%, 0.6)"
          strokeLinejoin="round"
          strokeWidth={Math.max(adaptiveFontSize / 5, 1)}
          paintOrder="stroke"
          strokeLinecap="round"
          initial={false}
          animate={module.idPosition}
          transition={transition}
        >
          {module.moduleId}
        </motion.text>
      )}

      {showModuleNames && module.textAnchor != null && (
        <motion.text
          fontSize={adaptiveFontSize}
          textAnchor={module.textAnchor}
          dy={adaptiveFontSize / 3}
          strokeWidth={0}
          fill={isSelected ? "#f00" : "#000"}
          initial={false}
          animate={module.namePosition}
          transition={transition}
        >
          {module.name || module.largestLeafNodes.join(", ")}
        </motion.text>
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
