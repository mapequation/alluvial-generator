import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap/parser";
import { MdClear, MdOutlineDelete, MdUpload } from "react-icons/md";
import { IoLayersOutline } from "react-icons/io5";
import { BiNetworkChart } from "react-icons/bi";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Step, Steps } from "chakra-ui-steps";
import { Reorder, useMotionValue } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StoreContext } from "../../store";
import id from "../../utils/id";
import "./LoadNetworks.css";
import useRaisedShadow from "../../hooks/useRaisedShadow";
import TreePath from "../../utils/TreePath";
import { normalize } from "../../utils/math";
import humanFileSize from "../../utils/human-file-size";
import useEventListener from "../../hooks/useEventListener";

const acceptedFormats = [".tree", ".ftree", ".clu", ".json"].join(",");
const exampleDataFilename = "science-1998-2001-2007.json";

async function fetchExampleData(filename = exampleDataFilename) {
  const res = await fetch(`/alluvial/data/${filename}`);
  return await res.json();
}

function createError(file, code, message) {
  return {
    file,
    errors: [{ code, message }],
  };
}

export default observer(function LoadNetworks({ onClose }) {
  const store = useContext(StoreContext);
  const toast = useToast();
  const dropzoneBg = useColorModeValue(
    "var(--chakra-colors-gray-50)",
    "var(--chakra-colors-gray-600)"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);
  const [files, setFiles] = useState(store.files);
  const reset = useCallback(() => setFiles([]), [setFiles]);

  const { open, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    accept: acceptedFormats,
    onDropRejected: (rejectedFiles) =>
      toast({
        title: "File rejected",
        description: `${rejectedFiles[0]} is not a valid file format.`,
        status: "error",
        duration: 5000,
        variant: "subtle",
        isClosable: true,
      }),
    onDrop: async (acceptedFiles) => {
      console.time("onDrop");
      setProgressVisible(true);

      const readFiles = await Promise.all(acceptedFiles.map(readFile));
      const newFiles = [];
      const errors = [];

      const totProgress = acceptedFiles.length + 1;
      setProgress(100 / totProgress);

      for (let i = 0; i < acceptedFiles.length; ++i) {
        setProgress((100 * (i + 2)) / totProgress);
        const file = acceptedFiles[i];
        const format = fileExtension(file.name);

        let contents = null;

        if (format === "json") {
          try {
            contents = JSON.parse(readFiles[i]);

            if (contents.networks !== undefined) {
              // a diagram contains several networks
              // duplicate file for each network
              newFiles.push(...createFilesFromDiagramObject(contents, file));

              // if any file ids already exist, give a new id
              for (let file of newFiles) {
                if (files.some((f) => f.id === file.id)) {
                  file.id = id();
                }
              }
              continue;
            }
          } catch (e) {
            errors.push(createError(file, "invalid-json", e.message));
            continue;
          }
        } else {
          try {
            contents = parse(readFiles[i]);
          } catch (e) {
            errors.push(createError(file, "parse-error", e.message));
            continue;
          }
        }

        if (!contents) {
          errors.push(
            createError(file, "invalid-format", "Could not parse file")
          );
          continue;
        }

        setIdentifiers(contents, format);

        try {
          newFiles.push(
            Object.assign(file, {
              id: id(),
              format,
              ...calcStatistics(contents),
              ...contents,
            })
          );
        } catch (e) {
          errors.push(createError(file, "invalid-format", e.message));
        }
      }

      setFiles([...files, ...newFiles]);

      errors.forEach(({ file, errors }) => {
        toast({
          title: `Could not load ${file.name}`,
          description: errors.map(({ message }) => message).join("\n"),
          status: "error",
          variant: "subtle",
          duration: 5000,
          isClosable: true,
        });
      });

      setProgressVisible(false);
      console.timeEnd("onDrop");
    },
  });

  const createDiagram = useCallback(() => {
    // TODO already loaded?
    // TODO set state from json
    setIsLoading(true);
    store.setFiles(files);
    onClose();
  }, [onClose, files, store, setIsLoading]);

  const loadExample = useCallback(async () => {
    console.time("loadExample");
    setIsLoadingExample(true);
    try {
      const json = await fetchExampleData();
      const emptyFile = new File([], exampleDataFilename);
      const files = createFilesFromDiagramObject(json, emptyFile);
      store.setFiles(files);
      onClose();
    } catch (e) {
      console.error(e);
    }
    console.timeEnd("loadExample");
  }, [onClose, store, setIsLoadingExample]);

  const removeFileId = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
  };

  const toggleMultilayerExpanded = (file) => {
    if (!file.isMultilayer) return;

    if (file.isExpanded === undefined) {
      file.isExpanded = false;
    }

    if (file.isExpanded) {
      const aggregated = Object.assign({}, file);
      aggregated.id = file.originalId;
      aggregated.originalId = undefined;
      aggregated.nodes = [];
      aggregated.numLayers = 0;
      aggregated.isExpanded = false;
      aggregated.layerId = undefined;

      let firstIndex = 0;

      const parts = files.filter((f, i) => {
        const part = f.isMultilayer && f.originalId === file.originalId;
        if (part) {
          firstIndex = Math.min(firstIndex, i);
        }
        return part;
      });

      for (const part of parts) {
        aggregated.numLayers++;
        aggregated.nodes.push(...part.nodes);
      }

      const numTopModules = new Set();
      for (const node of aggregated.nodes) {
        numTopModules.add(node.path[0]);
      }

      aggregated.numTopModules = numTopModules.size;

      Object.assign(aggregated, calcStatistics(aggregated));
      setIdentifiers(aggregated, "tree");

      const newFiles = files.filter((f) => f.originalId !== file.originalId);
      newFiles.splice(firstIndex, 0, aggregated);

      setFiles(newFiles);
    } else {
      const layers = {};

      file.isExpanded = true;
      setIdentifiers(file, "tree");

      file.nodes.forEach((node) => {
        if (!layers[node.layerId]) {
          const layer = (layers[node.layerId] = Object.assign({}, file));
          layer.numTopModules = new Set();
          layer.id = id();
          layer.originalId = file.id;
          layer.name = file.name;
          layer.lastModified = file.lastModified;
          layer.numLayers = 1;
          layer.layerId = node.layerId;
          layer.size = file.size;
          layer.nodes = [];
          layer.isExpanded = true;
        }

        layers[node.layerId].numTopModules.add(node.path[0]);
        layers[node.layerId].nodes.push(node);
      });

      for (const layer of Object.values(layers)) {
        layer.numTopModules = layer.numTopModules.size;
        Object.assign(layer, calcStatistics(layer));
      }

      const index = files.indexOf(file);
      const newFiles = [...files];
      newFiles.splice(index, 1, ...Object.values(layers));
      setFiles(newFiles);
    }
  };

  useEventListener("keydown", (event) => {
    if (store.editMode) return;

    if (event?.key === "c" && files.length > 0) {
      createDiagram();
    } else if (event?.key === "Backspace") {
      reset();
    } else if (event?.key === "e") {
      loadExample();
    }
  });

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Load network partitions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <MyStepper activeStep={files.length > 0 ? 2 : 1} />

          {progressVisible && <Progress value={progress} size="xs" />}
          <div
            style={{ background: dropzoneBg }}
            className="dropzone"
            {...getRootProps()}
          >
            <Reorder.Group
              className="parent"
              axis="x"
              layoutScroll
              values={files}
              onReorder={setFiles}
            >
              {files.map((file) => (
                <Item
                  key={file.id}
                  file={file}
                  onRemove={() => removeFileId(file.id)}
                  onMultilayerClick={() => toggleMultilayerExpanded(file)}
                />
              ))}
            </Reorder.Group>
            <input {...getInputProps()} />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            mr={2}
            onClick={loadExample}
            variant="outline"
            isLoading={isLoadingExample}
          >
            Load Example
          </Button>
          <Button
            disabled={files.length === 0}
            onClick={reset}
            leftIcon={<MdOutlineDelete />}
            mr="auto"
            variant="outline"
          >
            Clear
          </Button>
          <Button
            onClick={open}
            mr={2}
            variant="outline"
            isActive={files.length === 0}
            leftIcon={<MdUpload />}
          >
            Open
          </Button>
          <Button
            variant="outline"
            disabled={files.length === 0}
            isActive={files.length > 0}
            isLoading={isLoading}
            onClick={createDiagram}
          >
            Create Diagram
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});

function FileBackground({ file, fill, ...props }) {
  const minFlow = 1e-4;

  const values = normalize(
    Array.from(Object.values(file.flowDistribution))
      .filter((flow) => flow > minFlow)
      .sort()
  );

  const height = 300;

  const margin = values.length < 10 ? 10 : 100 / values.length;

  const usableHeight = Math.max(
    0,
    values.length < 2 ? height : height - margin * (values.length - 1)
  );

  let prevY = 0;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 150 300"
      opacity={0.2}
      preserveAspectRatio="none"
      {...props}
    >
      <g fill={fill}>
        {values.map((flow, i) => {
          const y = prevY;
          const height = flow * usableHeight;
          prevY += height + margin;
          return <rect key={i} x={0} y={y} width="100%" height={height} />;
        })}
      </g>
    </svg>
  );
}

function Item({ file, onRemove, onMultilayerClick }) {
  const x = useMotionValue(0);
  const bg = useColorModeValue("white", "gray.600");
  const fg = useColorModeValue("gray.800", "whiteAlpha.900");
  const fill = useColorModeValue(
    "var(--chakra-colors-gray-800)",
    "var(--chakra-colors-whiteAlpha-900)"
  );
  const boxShadow = useRaisedShadow(x);

  const truncatedName = ((name) => {
    const maxLength = 5;
    const nameParts = name.split(".");
    if (nameParts[0].length < maxLength) {
      return name;
    }
    return nameParts[0].slice(0, maxLength) + "..." + nameParts[1];
  })(file.name);

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
              isRound
              icon={file.isExpanded ? <LayerIcon /> : <IoLayersOutline />}
              size="md"
              fontSize="1.3rem"
              color={fg}
              bg={bg}
              boxShadow="md"
            />
          ) : (
            <IconButton
              aria-label="graph"
              isRound
              icon={<BiNetworkChart />}
              size="md"
              fontSize="1.3rem"
              pointerEvents="none"
              color={fg}
              bg={bg}
              boxShadow="md"
            />
          )}

          <List
            bg={bg}
            fontSize="sm"
            borderRadius={5}
            boxShadow="md"
            p={2}
            mt={8}
          >
            <ListItem fontWeight={600} overflowWrap="anyhwere">
              {truncatedName.length === file.name.length ? (
                file.name
              ) : (
                <Tooltip label={file.name} aria-label={file.name}>
                  {truncatedName}
                </Tooltip>
              )}
            </ListItem>

            {file.isMultilayer && !file.isExpanded && (
              <ListItem>{file.numLayers + " layers"}</ListItem>
            )}
            {file.isMultilayer && file.isExpanded && (
              <ListItem>{"layer " + file.layerId}</ListItem>
            )}
            {file.nodes && (
              <ListItem>
                {file.nodes.length +
                  (file.isStateNetwork ? " state nodes" : " nodes")}
              </ListItem>
            )}
            {file.numTopModules && (
              <ListItem>
                {file.numTopModules +
                  (file.numTopModules > 1 ? " top modules" : " top module")}
              </ListItem>
            )}
            {file.numLevels && (
              <ListItem>
                {file.numLevels + (file.numLevels > 1 ? " levels" : "level")}
              </ListItem>
            )}
            {file.codelength && (
              <ListItem>{file.codelength.toFixed(3) + " bits"}</ListItem>
            )}
            {file.size > 0 && <ListItem>{humanFileSize(file.size)}</ListItem>}
          </List>

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
        </Box>
      </Box>
    </Reorder.Item>
  );
}

function MyStepper({ activeStep }) {
  return (
    <Steps
      activeStep={activeStep}
      size="sm"
      colorScheme="blue"
      sx={{ margin: "1em auto 2em", width: "90%" }}
    >
      <Step
        label="Run Infomap"
        description={
          <a href="//mapequation.org/infomap">Infomap Online or standalone</a>
        }
      />
      <Step
        label="Load network partitions"
        description={
          <a href="//mapequation.org/infomap/#Output">
            Infomap output formats: {acceptedFormats}
          </a>
        }
      />
      <Step
        label="Create alluvial diagram"
        description="Highlight partition differences"
      />
    </Steps>
  );
}

function createFilesFromDiagramObject(json, file) {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network) => network.nodes.length)
      .reduce((tot, b) => tot + b, 0) || 1;

  // TODO extract state

  return json.networks.map((network) => {
    setIdentifiers(network, "json");

    return {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      name: network.name,
      id: network.id,
      format: "json",
      ...calcStatistics(network),
      ...network,
    };
  });
}

function calcStatistics(file) {
  const flowDistribution = {};
  const layerIds = new Set();

  file.nodes.forEach((node) => {
    const topModule = node.path[0];
    if (!flowDistribution[topModule]) {
      flowDistribution[topModule] = 0;
    }
    flowDistribution[topModule] += node.flow;

    if (node.layerId !== undefined) {
      layerIds.add(node.layerId);
    }
  });

  return {
    flowDistribution,
    isMultilayer: file?.nodes?.[0]["layerId"] !== undefined,
    isStateNetwork: file?.nodes?.[0]["stateId"] !== undefined,
    numLayers: layerIds.size || 1,
  };
}

function setIdentifiers(network, format) {
  const { nodes } = network;

  const stateOrNodeId = (node) => {
    if (network.isMultilayer && network.isExpanded) {
      return node.id;
    }
    return node.stateId != null ? node.stateId : node.id;
  };

  if (format === "json") {
    nodes.forEach((node) => {
      node.identifier = node.identifier ?? stateOrNodeId(node).toString();
      if (!Array.isArray(node.path)) {
        node.path = TreePath.toArray(node.path);
      }
    });
  } else if (format === "tree" || format === "ftree") {
    nodes.forEach((node) => (node.identifier = stateOrNodeId(node).toString()));
  } else if (format === "clu") {
    nodes.forEach((node) => {
      const id = stateOrNodeId(node);
      node.path = node.moduleId.toString();
      node.identifier = id.toString();
      node.name = id.toString();
    });
  }
}

function LayerIcon() {
  return (
    <svg
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
    >
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        transform="translate(0, 100)"
        d="M434.8 137.65l-149.36-68.1c-16.19-7.4-42.69-7.4-58.88 0L77.3 137.65c-17.6 8-17.6 21.09 0 29.09l148 67.5c16.89 7.7 44.69 7.7 61.58 0l148-67.5c17.52-8 17.52-21.1-.08-29.09z"
      />
    </svg>
  );
}