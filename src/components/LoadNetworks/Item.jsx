import { useState } from "react";
import { motion, Reorder, useMotionValue } from "framer-motion";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import useRaisedShadow from "../../hooks/useRaisedShadow";
import FileBackground from "./FileBackground";
import LayerIcon from "./LayerIcon";
import { IoLayersOutline, IoMenu } from "react-icons/io5";
import { BiNetworkChart } from "react-icons/bi";
import { GrTextAlignFull } from "react-icons/gr";
import { MdClear } from "react-icons/md";
import humanFileSize from "../../utils/human-file-size";
import Infomap from "@mapequation/infomap";

export default function Item({
  file,
  onRemove,
  onMultilayerClick,
  setIsRunning,
  updateFile,
  onError,
}) {
  const x = useMotionValue(0);
  const bg = useColorModeValue("white", "gray.600");
  const fg = useColorModeValue("gray.800", "whiteAlpha.900");
  const fill = useColorModeValue(
    "var(--chakra-colors-blackAlpha-400)",
    "var(--chakra-colors-whiteAlpha-400)"
  );
  const boxShadow = useRaisedShadow(x);

  // Infomap args
  const [numTrials, setNumTrials] = useState(file.numTrials ?? 5);
  const [directed, setDirected] = useState(file.directed ?? false);
  const [twoLevel, setTwoLevel] = useState(file.twoLevel ?? false);

  // Infomap progress
  const [progressVisible, setProgressVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const [settingsVisible, setSettingsVisible] = useState(file.noModularResult);
  const toggleSettings = () => setSettingsVisible(!settingsVisible);

  const truncatedName = ((name) => {
    const maxLength = 5;
    const nameParts = name.split(".");
    if (nameParts[0].length < maxLength) {
      return name;
    }
    return nameParts[0].slice(0, maxLength) + "..." + nameParts[1];
  })(file.fileName);

  const runInfomap = async () => {
    try {
      setProgressVisible(true);
      setProgress(0);
      setIsRunning(true);

      const result = await new Infomap().on("progress", setProgress).runAsync({
        network: file.network,
        filename: file.name,
        args: { output: "ftree", directed, twoLevel, numTrials },
      });

      setIsRunning(false);
      setProgressVisible(false);

      Object.assign(file, { numTrials, directed, twoLevel });

      const tree = result.ftree_states || result.ftree;
      if (tree) {
        updateFile(file, tree);
        setSettingsVisible(false);
      }
    } catch (e) {
      onError({
        title: `Error running Infomap on ${file.name}`,
        description: e.message,
      });
    }
  };

  const iconProps = {
    isRound: true,
    fontSize: "1.3rem",
    color: fg,
    bg,
    size: "md",
    boxShadow: "md",
  };

  return (
    <Reorder.Item
      id={file.id}
      value={file}
      className="child"
      role="group"
      style={{ boxShadow, x }}
    >
      <FileBackground
        file={file}
        style={{ position: "absolute" }}
        fill={fill}
      />
      <Box maxW="100%" h="100%" pos="relative" bg="transparent">
        <Box p={2}>
          {file.isMultilayer ? (
            <IconButton
              onClick={onMultilayerClick}
              aria-label="expand"
              icon={file.isExpanded ? <LayerIcon /> : <IoLayersOutline />}
              {...iconProps}
            />
          ) : (
            <IconButton
              aria-label="graph"
              icon={
                file.noModularResult ? <GrTextAlignFull /> : <BiNetworkChart />
              }
              pointerEvents="none"
              {...iconProps}
            />
          )}

          <Box
            bg={bg}
            fontSize="sm"
            borderRadius={5}
            boxShadow="md"
            p={2}
            mt={8}
            pos="relative"
          >
            {file.network && !file.noModularResult && !file.isExpanded && (
              <IconButton
                aria-label="settings"
                onClick={toggleSettings}
                isRound
                size="sm"
                variant="ghost"
                pos="absolute"
                top={0}
                right={0}
                icon={<IoMenu />}
              />
            )}

            <Text fontWeight={600} overflowWrap="anyhwere">
              {truncatedName.length === file.fileName.length ? (
                file.fileName
              ) : (
                <Tooltip label={file.fileName} aria-label={file.fileName}>
                  {truncatedName}
                </Tooltip>
              )}
            </Text>

            {file.size > 0 && <Text>{humanFileSize(file.size)}</Text>}

            {!settingsVisible && !file.noModularResult && (
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
                    {file.numLevels +
                      (file.numLevels > 1 ? " levels" : "level")}
                  </Text>
                )}
                {file.codelength && (
                  <Text>{file.codelength.toFixed(3) + " bits"}</Text>
                )}
              </motion.div>
            )}

            {settingsVisible && file.network && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FormControl isDisabled={progressVisible}>
                  <HStack justify="space-between">
                    <FormLabel
                      fontSize="sm"
                      fontWeight={400}
                      htmlFor="num-trials"
                      pt={1}
                    >
                      Trials
                    </FormLabel>
                    <NumberInput
                      id="num-trials"
                      size="xs"
                      value={numTrials}
                      onChange={(value) => setNumTrials(+value)}
                      min={1}
                      max={100}
                      step={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </HStack>
                  <Checkbox
                    isDisabled={progressVisible}
                    size="sm"
                    isChecked={directed}
                    onChange={(e) => setDirected(e.target.checked)}
                  >
                    Directed
                  </Checkbox>
                  <Checkbox
                    isDisabled={progressVisible}
                    size="sm"
                    isChecked={twoLevel}
                    onChange={(e) => setTwoLevel(e.target.checked)}
                  >
                    Two-level
                  </Checkbox>
                  <Button
                    mt={1}
                    isDisabled={progressVisible}
                    isLoading={progressVisible}
                    size="xs"
                    isFullWidth
                    type="submit"
                    onClick={runInfomap}
                  >
                    Run Infomap
                  </Button>
                </FormControl>
              </motion.div>
            )}
          </Box>

          <IconButton
            isRound
            size="xs"
            onClick={onRemove}
            pos="absolute"
            top={2}
            right={2}
            opacity={0}
            transform="scale(0.9)"
            transition="all 0.2s"
            _groupHover={{
              opacity: 1,
              transform: "scale(1)",
            }}
            aria-label="delete"
            color={fg}
            bg={bg}
            variant="ghost"
            fontSize="1.5rem"
            icon={<MdClear />}
          />

          {progressVisible && (
            <Progress value={progress} size="xs" mb={-2} mt={1} />
          )}
        </Box>
      </Box>
    </Reorder.Item>
  );
}
