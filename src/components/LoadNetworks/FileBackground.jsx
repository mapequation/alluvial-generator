import { normalize } from "../../utils/math";
import { motion } from "framer-motion";

export default function FileBackground({ file, fill, ...props }) {
  const flowDistribution = file.flowDistribution ?? { 0: 1 };

  const minFlow = 1e-4;

  const values = normalize(
    Array.from(Object.values(flowDistribution))
      .filter((flow) => flow > minFlow)
      .sort()
  );

  const height = 300;

  const margin = values.length < 10 ? 10 : 100 / values.length;

  const usableHeight = Math.max(
    0,
    values.length < 2 ? height : height - margin * (values.length - 1)
  );

  let prevY = 0;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 150 300"
      preserveAspectRatio="none"
      {...props}
    >
      <g fill={fill}>
        {values.map((flow, i) => {
          const y = prevY;
          const height = flow * usableHeight;
          prevY += height + margin;
          return (
            <motion.rect
              key={i}
              x={0}
              width={150}
              initial={{ y: 300, height: 0 }}
              animate={{ y, height }}
              transition={{ duration: 0.1, bounce: 0 }}
            />
          );
        })}
      </g>
    </svg>
  );
}
