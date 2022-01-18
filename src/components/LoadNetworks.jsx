import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap/parser";
import { MdClear, MdOutlineDelete, MdUpload } from "react-icons/md";
import {
  Avatar,
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
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { Step, Steps } from "../chakra-ui-steps";
import { Reorder, useMotionValue } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StoreContext } from "../store";
import id from "../utils/id";
import "./LoadNetworks.css";
import useRaisedShadow from "../hooks/useRaisedShadow";
import TreePath from "../utils/TreePath";
import { normalize } from "../utils/math";
import humanFileSize from "../utils/human-file-size";
import useEventListener from "../hooks/useEventListener";

const acceptedFormats = [".tree", ".ftree", ".clu", ".json"].join(",");
const exampleDataFilename = "science-1998-2001-2007.json";

async function fetchExampleData(filename = exampleDataFilename) {
  const res = await fetch(`/alluvial/data/${filename}`);
  return await res.json();
}

export default observer(function LoadNetworks({ onClose }) {
  const store = useContext(StoreContext);
  const toast = useToast();
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
      //setErrors([]);

      const readFiles = await Promise.all(acceptedFiles.map(readFile));
      const newFiles = [];
      const newErrors = [];

      for (let i = 0; i < acceptedFiles.length; ++i) {
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
            console.warn(e);
            newErrors.push({
              file,
              errors: [
                {
                  code: "invalid-json",
                  message: e.message,
                },
              ],
            });
            continue;
          }
        } else {
          try {
            contents = parse(readFiles[i]);
          } catch (e) {
            console.warn(e);
            newErrors.push({
              file,
              errors: [
                {
                  code: "parse-error",
                  message: e.message,
                },
              ],
            });
            continue;
          }
        }

        if (!contents) {
          console.warn(`Could not parse ${file.name}`);
          newErrors.push({
            file,
            errors: [
              {
                code: "invalid-format",
                message: "Could not parse file",
              },
            ],
          });
          continue;
        }

        setIdentifiers(contents.nodes, format);

        try {
          const flowDistribution = calculateFlowDistribution(contents);

          newFiles.push(
            Object.assign(file, {
              id: id(),
              format,
              flowDistribution,
              ...contents,
            })
          );
        } catch (e) {
          console.warn(e);
          newErrors.push({
            file,
            errors: [
              {
                code: "invalid-format",
                message: e.message,
              },
            ],
          });
        }
      }

      setFiles([...files, ...newFiles]);

      newErrors.forEach(({ file, errors }) => {
        toast({
          title: `Could not load ${file.name}`,
          description: errors.map(({ message }) => message).join("\n"),
          status: "error",
          variant: "subtle",
          duration: 5000,
          isClosable: true,
        });
      });

      console.timeEnd("onDrop");
    },
  });

  const createDiagram = useCallback(() => {
    // TODO already loaded?
    // TODO set state from json
    store.setFiles(files);
    onClose();
  }, [onClose, files, store]);

  const loadExample = useCallback(async () => {
    console.time("loadExample");
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
  }, [onClose, store]);

  const removeFileId = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
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

          <div className="dropzone" {...getRootProps()}>
            <Reorder.Group
              className="parent"
              axis="x"
              layoutScroll
              values={files}
              onReorder={setFiles}
            >
              {files.map((file, i) => (
                <Item
                  number={i + 1}
                  key={file.id}
                  file={file}
                  onClick={removeFileId}
                />
              ))}
            </Reorder.Group>
            <input {...getInputProps()} />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button mr={2} onClick={loadExample} variant="outline">
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
            onClick={createDiagram}
          >
            Create Diagram
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});

const FileBackground = observer(function FileBackground({ file, ...props }) {
  const store = useContext(StoreContext);
  const minFlow = 1e-4;

  const values = normalize(
    Array.from(Object.values(file.flowDistribution))
      .filter((flow) => flow > minFlow)
      .sort()
  );

  const height = 300;
  const margin = 10;
  const usableHeight =
    values.length > 2 ? height - margin * (values.length - 1) : height;

  let prevY = 0;

  return (
    <svg width="100%" height="100%" {...props} opacity={0.2}>
      {values.map((k, i) => {
        const y = prevY;
        const rectHeight = k * usableHeight;
        prevY += rectHeight + margin;
        return (
          <rect
            key={i}
            x={0}
            y={y}
            width="100%"
            height={rectHeight}
            fill={store.defaultHighlightColor}
          />
        );
      })}
    </svg>
  );
});

function Item({ number, file, onClick }) {
  const x = useMotionValue(0);
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
      style={{ boxShadow, x }}
    >
      <FileBackground file={file} style={{ position: "absolute" }} />
      <Box maxW="100%" h="100%" pos="relative" bg="transparent">
        <Box p={4}>
          <Avatar
            bg="white"
            boxShadow="md"
            color="gray.500"
            name={number.toString()}
          />

          <List
            bg="white"
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

            {file.nodes && <ListItem>{file.nodes.length + " nodes"}</ListItem>}
            {file.numTopModules && (
              <ListItem>{file.numTopModules + " top modules"}</ListItem>
            )}
            {file.numLevels && (
              <ListItem>{file.numLevels + " levels"}</ListItem>
            )}
            {file.codelength && (
              <ListItem>{file.codelength.toFixed(3) + " bits"}</ListItem>
            )}
            {file.size > 0 && <ListItem>{humanFileSize(file.size)}</ListItem>}
          </List>

          <IconButton
            isRound
            size="xs"
            onClick={() => onClick(file.id)}
            className="delete-button"
            aria-label="delete"
            color="gray.500"
            bg="white"
            variant="unstyled"
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
    setIdentifiers(network.nodes, "json");

    const part = {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      name: network.name,
      id: network.id,
      format: "json",
      ...network,
    };

    if (!part.flowDistribution) {
      part.flowDistribution = calculateFlowDistribution(network);
    }

    return part;
  });
}

function calculateFlowDistribution(file) {
  const flowDistribution = {};

  file.nodes.forEach(({ flow, path }) => {
    const topModule = path[0];
    if (!flowDistribution[topModule]) {
      flowDistribution[topModule] = 0;
    }
    flowDistribution[topModule] += flow;
  });

  return flowDistribution;
}

function setIdentifiers(nodes, format) {
  const stateOrNodeId = (node) =>
    node.stateId != null ? node.stateId : node.id;

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
