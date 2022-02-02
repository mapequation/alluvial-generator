import { motion } from "framer-motion";
import LinearGradients from "./LinearGradients";

export default function Streamline({ link, opacity }) {
  const { path, transitionPath } = link;
  return (
    <motion.path
      id={link.id}
      className="streamline"
      fill={LinearGradients.fill(link)}
      initial={{ opacity: 0, d: transitionPath }}
      animate={{ opacity, d: path }}
      exit={{ opacity: 0, d: transitionPath }}
      transition={{ bounce: 0, duration: 0.2 }}
    />
  );
}
