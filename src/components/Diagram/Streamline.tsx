import { motion, MotionProps } from "framer-motion";
import type { StreamlineLink } from "../../alluvial";
import LinearGradients from "./LinearGradients";

export default function Streamline({
  link,
  opacity,
  ...props
}: {
  link: StreamlineLink;
  opacity: number;
} & MotionProps) {
  const { path, transitionPath } = link;
  return (
    <motion.path
      id={link.id}
      className="streamline"
      fill={LinearGradients.fill(link)}
      initial={{ opacity: 0, d: transitionPath }}
      animate={{ opacity, d: path }}
      exit={{ opacity: 0, d: transitionPath }}
      {...props}
    />
  );
}
