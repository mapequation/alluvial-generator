import { observer } from "mobx-react";
import { useContext } from "react";
import { motion } from "framer-motion";
import { StoreContext } from "../../store";
import LinearGradients from "./LinearGradients";
import Streamline from "./Streamline";
import Module from "./Module";

const Network = observer(function Network({ network, fillColor }) {
  const {
    streamlineThreshold,
    streamlineOpacity,
    networkFontSize,
    showNetworkNames,
  } = useContext(StoreContext);

  const links = network.getLinks(streamlineThreshold);
  const { namePosition } = network;

  const transition = { bounce: 0, duration: 0.2 };

  return (
    <g className="network">
      <defs>
        <LinearGradients activeIndices={activeHighlightIndices(links)} />
      </defs>
      {showNetworkNames && (
        <motion.g
          className="label"
          initial={false}
          animate={namePosition}
          transition={transition}
        >
          <motion.text
            className="name"
            animate={{ fontSize: networkFontSize, dy: networkFontSize }}
            transition={transition}
            textAnchor="middle"
            data-x={namePosition.x}
            data-y={namePosition.y}
          >
            {network.name}
          </motion.text>
        </motion.g>
      )}

      {links.map((link) => (
        <Streamline key={link.id} link={link} opacity={streamlineOpacity} />
      ))}

      {network.visibleChildren.map((module) => (
        <Module key={module.id} module={module} fillColor={fillColor} />
      ))}
    </g>
  );
});

function activeHighlightIndices(links) {
  const uniqueIndices = new Set();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  return Array.from(uniqueIndices, (indices) => indices.split("_").map(Number));
}

export default Network;
