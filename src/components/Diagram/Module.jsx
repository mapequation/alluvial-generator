import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import useOnClick from "../../hooks/useOnClick";
import raise from "../../utils/raise";

const Module = observer(function Module({ module, fillColor }) {
  const store = useContext(StoreContext);
  const dragControls = useDragControls();
  const ref = useRef();

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

  return (
    <motion.g
      ref={ref}
      className={`${isSelected ? "module selected" : "module"}`}
      style={{ filter: dropShadow(module) }}
      onClick={handler}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileDrag={{ opacity: 0.5 }}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragSnapToOrigin
      onDragStart={() => raise(ref.current)}
      onDrag={(event, info) => {
        console.log(event, info);
      }}
    >
      {module.children.map((group) => (
        <motion.rect
          onPointerDown={(event) => {
            if (event.shiftKey) {
              dragControls.start(event);
            }
          }}
          key={group.id}
          className="group"
          initial={false}
          animate={group.layout}
          fill={fillColor(group)}
        />
      ))}

      {showModuleId && (
        <motion.text
          fontSize={fontSize}
          textAnchor="middle"
          dy={3}
          stroke="#fff"
          strokeWidth={3}
          paintOrder="stroke"
          strokeLinecap="round"
          initial={false}
          animate={module.idPosition}
        >
          {module.moduleId}
        </motion.text>
      )}

      {showModuleNames && module.textAnchor != null && (
        <motion.text
          fontSize={fontSize}
          textAnchor={module.textAnchor}
          dy={3}
          strokeWidth={0}
          fill={isSelected ? "#f00" : "#000"}
          initial={false}
          animate={module.namePosition}
        >
          {module.largestLeafNodes.join(", ")}
        </motion.text>
      )}
    </motion.g>
  );
});

export default Module;
