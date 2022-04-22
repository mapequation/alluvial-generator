import { Box, Progress, Text, useColorModeValue } from "@chakra-ui/react";
import { parse } from "@mapequation/infomap-parser";
import { useInfomap } from "@mapequation/infomap-react";
import { useState } from "react";
import humanFileSize from "../../../utils/human-file-size";
import Background from "./Background";
import {
  NetworkIcon,
  RemoveButton,
  ReorderItem,
  SettingsButton,
  TruncatedFilename,
} from "./components";
import Infomap from "./Infomap";
import NetworkInfo from "./NetworkInfo";

export default function Item({
  file,
  onRemove,
  onMultilayerClick,
  setIsRunning,
  updateFile,
  onError,
}) {
  const bg = useColorModeValue("white", "gray.600");
  const fg = useColorModeValue("gray.800", "whiteAlpha.900");
  const fill = useColorModeValue(
    "var(--chakra-colors-blackAlpha-400)",
    "var(--chakra-colors-whiteAlpha-400)"
  );

  // Infomap args
  const [numTrials, setNumTrials] = useState(file.numTrials ?? 5);
  const [directed, setDirected] = useState(file.directed ?? false);
  const [twoLevel, setTwoLevel] = useState(file.twoLevel ?? false);

  const { runAsync, running, progress } = useInfomap({
    output: "ftree",
    twoLevel,
    directed,
    numTrials,
  });

  const [showInfomap, setShowInfomap] = useState(file.noModularResult);

  const runInfomap = async () => {
    try {
      setIsRunning(running);

      const result = await runAsync({
        network: file.network,
        filename: file.name,
      });

      setIsRunning(running);

      Object.assign(file, { numTrials, directed, twoLevel });

      const tree = result.ftree_states || result.ftree;
      if (tree) {
        const contents = parse(tree, null, true);
        updateFile(file, contents);
        setShowInfomap(false);
      }
    } catch (e) {
      setIsRunning(false);
      console.log(e);

      onError({
        title: `Error running Infomap on ${file.name}`,
        description: e.toString(),
      });
    }
  };

  const showInfomapButton =
    file.network && !file.noModularResult && !file.isExpanded;
  const showNetworkInfo = !showInfomap && !file.noModularResult;

  return (
    <ReorderItem id={file.id} value={file}>
      <Background file={file} style={{ position: "absolute" }} fill={fill} />

      <Box maxW="100%" h="100%" pos="relative" bg="transparent">
        <Box p={2}>
          <NetworkIcon
            file={file}
            onClick={onMultilayerClick}
            color={fg}
            bg={bg}
          />

          <RemoveButton onClick={onRemove} color={fg} bg={bg} />

          <Box
            bg={bg}
            fontSize="sm"
            borderRadius={5}
            boxShadow="md"
            p={2}
            mt={8}
            pos="relative"
          >
            {showInfomapButton && (
              <SettingsButton onClick={() => setShowInfomap(!showInfomap)} />
            )}

            <TruncatedFilename name={file.fileName} maxLength={10} />

            {file.size > 0 && <Text>{humanFileSize(file.size)}</Text>}

            {showNetworkInfo && <NetworkInfo file={file} />}

            {showInfomap && file.network && (
              <Infomap
                disabled={running}
                numTrials={numTrials}
                setNumTrials={setNumTrials}
                directed={directed}
                setDirected={setDirected}
                twoLevel={twoLevel}
                setTwoLevel={setTwoLevel}
                run={runInfomap}
              />
            )}
          </Box>

          {running && <Progress value={progress} size="xs" mb={-2} mt={1} />}
        </Box>
      </Box>
    </ReorderItem>
  );
}
