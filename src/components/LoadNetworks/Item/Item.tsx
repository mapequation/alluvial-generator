import { Box, Progress, Text, useColorModeValue } from "@chakra-ui/react";
import { parseTree } from "@mapequation/infomap-parser";
import { useInfomap } from "@mapequation/infomap-react";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { useError } from "../../../hooks/useError";
import { StoreContext } from "../../../store";
import humanFileSize from "../../../utils/human-file-size";
import { Context } from "../context";
import type { NetworkFile } from "../types";
import {
  calcStatistics,
  expandMultilayerFile,
  mergeMultilayerFiles,
  setIdentifiers,
} from "../utils";
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

export default observer(function Item({ file }: { file: NetworkFile }) {
  const bg = useColorModeValue("white", "gray.600");
  const fg = useColorModeValue("gray.800", "whiteAlpha.900");
  const fill = useColorModeValue(
    "var(--chakra-colors-blackAlpha-400)",
    "var(--chakra-colors-whiteAlpha-400)"
  );
  const { state, dispatch } = useContext(Context);
  const { identifier } = useContext(StoreContext);
  const onError = useError();

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
    dispatch({ type: "set", payload: { infomapRunning: true } });

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

        setShowInfomap(false);

        dispatch({
          type: "set",
          payload: {
            files: state.files.map((f) => (f.id === file.id ? file : f)),
          },
        });
      }
    } catch (e: any) {
      onError({
        title: `Error running Infomap on ${file.name}`,
        description: e.toString(),
      });
    }

    dispatch({ type: "set", payload: { infomapRunning: false } });
  };

  const toggleMultilayerExpanded = () => {
    if (!file.isMultilayer) return;

    if (file.isExpanded === undefined) {
      file.isExpanded = false;
    }

    const files = file.isExpanded
      ? mergeMultilayerFiles(file, state.files)
      : expandMultilayerFile(file, state.files);

    dispatch({ type: "set", payload: { files } });
  };

  return (
    <ReorderItem id={file.id} value={file}>
      <Background file={file} style={{ position: "absolute" }} fill={fill} />

      <Box maxW="100%" h="100%" pos="relative" bg="transparent">
        <Box p={2}>
          <NetworkIcon
            file={file}
            onClick={toggleMultilayerExpanded}
            color={fg}
            bg={bg}
          />

          <RemoveButton
            onClick={() =>
              dispatch({
                type: "set",
                payload: {
                  files: state.files.filter((f) => f.id !== file.id),
                },
              })
            }
            color={fg}
            bg={bg}
          />

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
});
