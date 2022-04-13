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
import { motion, Reorder, useMotionValue } from "framer-motion";
import { useState } from "react";
import { BiNetworkChart } from "react-icons/bi";
import { GrTextAlignFull } from "react-icons/gr";
import { IoLayersOutline, IoMenu } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import useRaisedShadow from "../../hooks/useRaisedShadow";
import humanFileSize from "../../utils/human-file-size";
import FileBackground from "./FileBackground";
import LayerIcon from "./LayerIcon";
import { useInfomap } from "./useInfomap";

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

  const { runAsync, running, progress } = useInfomap({
    output: "ftree",
    twoLevel,
    directed,
    numTrials,
  });

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
      setIsRunning(running);

      const result = await runAsync({
        network: file.network,
        filename: file.name,
      });

      setIsRunning(running);

      Object.assign(file, { numTrials, directed, twoLevel });

      const tree = result.ftree_states || result.ftree;
      if (tree) {
        updateFile(file, tree);
        setSettingsVisible(false);
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -100 }}
      transition={{ duration: 0.15 }}
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
                _focus={{
                  outline: "none",
                }}
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
              <NetworkInfo file={file} />
            )}

            {settingsVisible && file.network && (
              <Settings
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
    </Reorder.Item>
  );
}

function NetworkInfo({ file }) {
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

function Settings(props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FormControl isDisabled={props.disabled}>
        <HStack justify="space-between">
          <FormLabel fontSize="sm" fontWeight={400} htmlFor="num-trials" pt={1}>
            Trials
          </FormLabel>
          <NumberInput
            id="num-trials"
            size="xs"
            value={props.numTrials}
            onChange={(value) => props.setNumTrials(+value)}
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
          isDisabled={props.disabled}
          size="sm"
          isChecked={props.directed}
          onChange={(e) => props.setDirected(e.target.checked)}
        >
          Directed
        </Checkbox>
        <Checkbox
          isDisabled={props.disabled}
          size="sm"
          isChecked={props.twoLevel}
          onChange={(e) => props.setTwoLevel(e.target.checked)}
        >
          Two-level
        </Checkbox>
        <Button
          mt={1}
          isDisabled={props.disabled}
          isLoading={props.disabled}
          size="xs"
          isFullWidth
          type="submit"
          onClick={props.run}
        >
          Run Infomap
        </Button>
      </FormControl>
    </motion.div>
  );
}
