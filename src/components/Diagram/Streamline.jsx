import { motion } from "framer-motion";
import LinearGradients from "./LinearGradients";

export default function Streamline({ link, opacity }) {
  return (
    <motion.path
      id={link.id}
      className="streamline"
      fill={LinearGradients.fill(link)}
      initial={{ opacity: 0 }}
      animate={{ opacity, d: link.path }}
      transition={{ bounce: 0, duration: 0.2 }}
      exit={{ opacity: 0 }}
    />
  );
}
