import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap/parser";
import { MdOutlineDelete, MdUpload } from "react-icons/md";
import {
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Reorder } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StoreContext } from "../../store";
import id from "../../utils/id";
import "./LoadNetworks.css";
import TreePath from "../../utils/TreePath";
import useEventListener from "../../hooks/useEventListener";
import Item from "./Item";
import Stepper from "./Stepper";
import JSZip from "jszip";

const acceptedFormats = [".tree", ".ftree", ".clu", ".json", ".zip"].join(",");
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
  const [files, setFiles] = useState(store.files);
  const reset = useCallback(() => setFiles([]), [setFiles]);

  const { open, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    accept: acceptedFormats,
    onDropRejected: (rejectedFiles) =>
      rejectedFiles.forEach((rejectedFile) =>
        toast({
          title: `Cannot open ${rejectedFile.file.name}`,
          description: rejectedFile.errors[0].message,
          status: "error",
          variant: "subtle",
          duration: 5000,
          isClosable: true,
        })
      ),
    onDrop: async (acceptedFiles) => {
      console.time("onDrop");

      const readFiles = [];
      const errors = [];

      const accepted = acceptedFormats
        .split(",")
        .map((ext) => ext.slice(1))
        .filter((ext) => ext !== "zip");

      let fileIndex = 0;
      for (const file of [...acceptedFiles]) {
        if (file?.type === "application/zip") {
          try {
            // Remove the zipped file from the list of files
            acceptedFiles.splice(fileIndex, 1);

            const zipFile = await JSZip.loadAsync(file);

            for (const [name, compressedFile] of Object.entries(
              zipFile.files
            )) {
              const extension = fileExtension(name);

              if (!accepted.includes(extension)) {
                errors.push(
                  createError(
                    { name },
                    "unsupported-format",
                    `Unsupported file format: ${extension}`
                  )
                );
                continue;
              }

              const uncompressedFile = await compressedFile.async("string");
              readFiles.push(uncompressedFile);

              // Add the decompressed file to the list of files
              acceptedFiles.splice(fileIndex, 0, {
                name,
                // Hack to get the decompressed size. Uses private fields of the JSZip object
                size: compressedFile?._data?.uncompressedSize ?? file.size,
                lastModified: file.lastModified,
              });
              fileIndex++;
            }
          } catch (e) {
            errors.push(createError(file, "unsupported-format", e.message));
          }
        } else {
          readFiles.push(await readFile(file));
          fileIndex++;
        }
      }

      const newFiles = [];

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
              const diagramFiles = createFilesFromDiagramObject(contents, file);

              // if any file ids already exist, give a new id
              for (let existingFile of newFiles) {
                for (let diagramFile of diagramFiles) {
                  if (existingFile.id === diagramFile.id) {
                    diagramFile.id = id();
                  }
                }
              }

              newFiles.push(...diagramFiles);
              continue;
            }
          } catch (e) {
            errors.push(createError(file, "invalid-json", e.message));
            continue;
          }
        } else {
          try {
            contents = parse(readFiles[i], null, true);
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
            Object.assign(
              {},
              {
                ...file,
                fileName: file.name, // Save the original filename so we don't overwrite it
                name: file.name,
                lastModified: file.lastModified,
                size: file.size,
                id: id(),
                format,
                ...calcStatistics(contents),
                ...contents,
              }
            )
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
      aggregated.name = file.fileName;
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
      setIdentifiers(file, "multilayer-expanded");

      file.nodes.forEach((node) => {
        if (!layers[node.layerId]) {
          const layerId = node.layerId;
          const layer = (layers[layerId] = Object.assign({}, file));
          layer.numTopModules = new Set();
          layer.id = id();
          layer.originalId = file.id;

          layer.lastModified = file.lastModified;
          layer.numLayers = 1;
          layer.layerId = layerId;
          layer.size = file.size;
          layer.nodes = [];
          layer.isExpanded = true;

          let layerNameFound = false;
          if (file.layers != null) {
            const name = file.layers?.find((l) => l.id === layerId)?.name;
            if (name != null) {
              layerNameFound = true;
              layer.name = name;
            }
          }

          if (!layerNameFound) {
            layer.name = `Layer ${layerId}`;
          }
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

      // Decrease flow threshold as layers contain less flow than an individual file
      // TODO: Show a minimum number of modules per level in each network?
      if (store.flowThreshold > 1e-3) {
        store.setFlowThreshold(1e-3);
      }
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
          <Stepper
            activeStep={files.length > 0 ? 2 : 1}
            acceptedFormats={acceptedFormats}
          />

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
      fileName: file.name,
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

  const stateOrNodeId = (node) =>
    node.stateId != null ? node.stateId : node.id;

  if (format === "multilayer-expanded") {
    // Expanded multilayer networks must use the physical
    // node id, as the state ids are unique per layer.
    nodes.forEach((node) => (node.identifier = node.id.toString()));
  } else if (format === "json") {
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
