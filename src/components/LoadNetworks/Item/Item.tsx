import { Box, Progress, Text, useColorModeValue } from "@chakra-ui/react";
import { parseTree } from "@mapequation/infomap-parser";
import { useInfomap } from "@mapequation/infomap-react";
import { useState } from "react";
import type { Identifier } from "../../../alluvial";
import type { OnError } from "../../../hooks/useError";
import humanFileSize from "../../../utils/human-file-size";
import type { NetworkFile } from "../types";
import { calcStatistics, setIdentifiers } from "../utils";
import Background from "./Background";
import {
  InfomapToggleButton,
  NetworkIcon,
  RemoveButton,
  ReorderItem,
  TruncatedFilename,
} from "./components";
import Infomap from "./Infomap";
import NetworkInfo from "./NetworkInfo";

export default function Item({
  file,
  identifier,
  onRemove,
  onMultilayerClick,
  setIsRunning,
  updateFile,
  onError,
}: {
  file: NetworkFile;
  identifier: Identifier;
  onRemove: () => void;
  onMultilayerClick: () => void;
  setIsRunning: (value: boolean) => void;
  updateFile: (file: NetworkFile) => void;
  onError: OnError;
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

  const [showInfomap, setShowInfomap] = useState(!file.haveModules);
  const showInfomapButton =
    file.haveModules && file.network && !file.isExpanded;

  const runInfomap = async () => {
    setIsRunning(true);
    try {
      const result = await runAsync({
        network: file.network,
        filename: file.name,
      });

      const tree = result.ftree_states || result.ftree;

      if (tree) {
        const contents = parseTree(tree, undefined, true, true);
        setIdentifiers(contents.nodes, "ftree", identifier);

        Object.assign(file, {
          numTrials,
          directed,
          twoLevel,
          haveModules: true,
          ...contents,
          ...calcStatistics(contents.nodes),
        });

        updateFile(file);
        setShowInfomap(false);
      }
    } catch (e: any) {
      onError({
        title: `Error running Infomap on ${file.name}`,
        description: e.toString(),
      });
    }
    setIsRunning(false);
  };

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
              <InfomapToggleButton
                onClick={() => setShowInfomap(!showInfomap)}
              />
            )}

            <TruncatedFilename name={file.filename} maxLength={10} />

            {file.size > 0 && <Text>{humanFileSize(file.size)}</Text>}

            {showInfomap && file.network ? (
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
            ) : (
              <NetworkInfo file={file} />
            )}
          </Box>

          {running && <Progress value={progress} size="xs" mb={-2} mt={1} />}
        </Box>
      </Box>
    </ReorderItem>
  );
}
