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
      {file.isMultilayer && (
        <Text>
          {!file.isExpanded
            ? pluralize(file.numLayers!, "layer")
            : "layer " + file.layerId}
        </Text>
      )}
      {file.nodes && (
        <Text>
          {`${file.nodes.length} ${
            file.isStateNetwork ? "state nodes" : "nodes"
          }`}
        </Text>
      )}
      {file.numTopModules && (
        <Text>{pluralize(file.numTopModules, "top module")}</Text>
      )}
      {file.numLevels && <Text>{pluralize(file.numLevels, "level")}</Text>}
      {file.codelength && <Text>{file.codelength.toFixed(3) + " bits"}</Text>}
    </motion.div>
  );
}

function pluralize(num: number, noun: string) {
  return `${num} ${num !== 1 ? noun + "s" : noun}`;
}
