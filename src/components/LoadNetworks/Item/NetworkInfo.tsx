import { Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { NetworkFile } from "../types";

export default function NetworkInfo({ file }: { file: NetworkFile }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {file.isMultilayer && !file.isExpanded && (
        <Text>{file.numLayers + " layers"}</Text>
      )}
      {file.isMultilayer && file.isExpanded && (
        <Text>{"layer " + file.layerId}</Text>
      )}
      {file.nodes && (
        <Text>
          {file.nodes.length +
            (file.isStateNetwork ? " state nodes" : " nodes")}
        </Text>
      )}
      {file.numTopModules && (
        <Text>
          {file.numTopModules +
            (file.numTopModules > 1 ? " top modules" : " top module")}
        </Text>
      )}
      {file.numLevels && (
        <Text>
          {file.numLevels + (file.numLevels > 1 ? " levels" : " level")}
        </Text>
      )}
      {file.codelength && <Text>{file.codelength.toFixed(3) + " bits"}</Text>}
    </motion.div>
  );
}
