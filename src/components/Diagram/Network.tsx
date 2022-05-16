import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useContext } from "react";
import type { Network as NetworkType } from "../../alluvial";
import { StreamlineLink } from "../../alluvial";
import { StoreContext } from "../../store";
import LinearGradients from "./LinearGradients";
import ModulesWrapper, { ModulesWrapperProps } from "./ModulesWrapper";
import Streamline from "./Streamline";

const transition = { bounce: 0, duration: 0.2 } as const;

const Network = observer(function Network({
  network,
  ...props
}: {
  network: NetworkType;
} & ModulesWrapperProps) {
  const {
    streamlineThreshold,
    streamlineOpacity,
    networkFontSize,
    showNetworkNames,
  } = useContext(StoreContext);

  const links = network.getLinks(streamlineThreshold);
  const { namePosition } = network;

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

      <ModulesWrapper network={network} transition={transition} {...props} />

      {links.map((link) => (
        <Streamline
          key={link.id}
          link={link}
          opacity={streamlineOpacity}
          transition={transition}
        />
      ))}
    </g>
  );
});

function activeHighlightIndices(links: Iterable<StreamlineLink>) {
  const uniqueIndices = new Set<string>();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  return Array.from(uniqueIndices, (indices) => indices.split("_").map(Number));
}

export default Network;
