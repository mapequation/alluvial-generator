import { Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

type File = {
  multilayer?: boolean;
  expanded?: boolean;
  numLayers?: number;
  layerId?: number;
  nodes?: any[]; // FIXME any
  stateNetwork?: boolean;
  numTopModules?: number;
  numLevels?: number;
  codelength?: number;
};

export default function NetworkInfo({ file }: { file: File }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {file.multilayer && !file.expanded && (
        <Text>{file.numLayers + " layers"}</Text>
      )}
      {file.multilayer && file.expanded && (
        <Text>{"layer " + file.layerId}</Text>
      )}
      {file.nodes && (
        <Text>
          {file.nodes.length + (file.stateNetwork ? " state nodes" : " nodes")}
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
          {file.numLevels + (file.numLevels > 1 ? " levels" : "level")}
        </Text>
      )}
      {file.codelength && <Text>{file.codelength.toFixed(3) + " bits"}</Text>}
    </motion.div>
  );
}
