import { motion, MotionProps } from "framer-motion";
import { Module } from "../../alluvial";

export default function SelectedModule({
  module,
  ...props
}: { module: Module | null } & MotionProps) {
  if (module == null) {
    return null;
  }

  return (
    <motion.rect
      initial={false}
      animate={module.layout}
      stroke="#f00"
      strokeWidth="1"
      pointerEvents="none"
      fill="none"
      {...props}
    />
  );
}
