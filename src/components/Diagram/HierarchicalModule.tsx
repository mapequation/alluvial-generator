import { motion, MotionProps } from "framer-motion";
import { SVGProps } from "react";
import { HierarchicalModule } from "../../alluvial/Network";

export function OutlineModule({
  module,
  opacity,
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
      animate={{ x, y, width, height, opacity }}
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
  opacity,
  offset,
  transition,
  fill,
}: {
  module: HierarchicalModule;
  offset: number;
} & MotionProps &
  SVGProps<SVGRectElement>) {
  const offsetBy = offset * (module.maxModuleLevel - module.moduleLevel);
  const { layout } = module;

  return (
    <g style={{ isolation: "isolate", mixBlendMode: "difference" }}>
      <motion.g
        className="super-module-offset"
        initial={{ x: 0, y: 0 }}
        animate={{ x: offsetBy, y: offsetBy }}
        exit={{ x: 0, y: 0 }}
        data-x={offsetBy}
        data-y={offsetBy}
        transition={transition}
      >
        <motion.rect
          className="super-module"
          id={module.path.toString()}
          initial={{ ...layout, opacity: 0 }}
          animate={{ ...layout, opacity }}
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
