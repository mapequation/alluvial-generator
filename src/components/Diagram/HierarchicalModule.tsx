import { motion, MotionProps } from "framer-motion";
import { SVGProps } from "react";
import { HierarchicalModule } from "../../alluvial/Network";

export function OutlineModule({
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

export function ShadowModule({
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
