// @ts-nocheck
// FIXME enable typescript checking
import { extension as fileExtension, parse, readFile } from "@mapequation/infomap/parser";
import JSZip from "jszip";
import localforage from "localforage";
import id from "../../utils/id";
import TreePath from "../../utils/TreePath";

// FIXME any
function createError(file: any, code: string, message: string) {
  return {
    file,
    errors: [{ code, message }],
  };
}

export async function parseAcceptedFiles(
  acceptedFiles: any[], // FIXME any
  currentFiles: any[], // FIXME any
  acceptedFormats: string[],
  storeIdentifier: string
) {
  const readFiles = [];
  const errors = [];

  const textFormats = acceptedFormats.filter((ext) => ext !== "zip");

  // Unzip compressed files, read uncompressed files
  let fileIndex = 0;
  for (const file of [...acceptedFiles]) {
    if (file?.type === "application/zip") {
      try {
        // Remove the zipped file from the list of files
        acceptedFiles.splice(fileIndex, 1);

        const zipFile = await JSZip.loadAsync(file);

        for (const [name, compressedFile] of Object.entries(zipFile.files)) {
          const extension = fileExtension(name) ?? "";

          if (!textFormats.includes(extension)) {
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
            // @ts-ignore
            size: compressedFile?._data?.uncompressedSize ?? file.size,
            lastModified: file.lastModified,
          });
          fileIndex++;
        }
      } catch (e: any) {
        errors.push(createError(file, "unsupported-format", e.message));
      }
    } else {
      readFiles.push(await readFile(file));
      fileIndex++;
    }
  }

  const newFiles = [];

  // FIXME any
  const createFile = (file: any, format: string, contents: any) => {
    const newFile = Object.assign(
      {},
      {
        ...file,
        fileName: file.name, // Save the original filename so we don't overwrite it
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        id: id(),
        format,
        ...contents,
      }
    );

    // .net files has noModularResult = true by default
    // all other format lack the noModularResult property
    if (contents.noModularResult === undefined && !file.noModularResult) {
      Object.assign(newFile, calcStatistics(contents));
    }

    return newFile;
  };

  // Parse files
  for (let i = 0; i < acceptedFiles.length; ++i) {
    const file = acceptedFiles[i];
    const format = fileExtension(file.name) ?? "";

    let contents = null;

    if (format === "json") {
      try {
        contents = JSON.parse(readFiles[i]);

        if (contents.networks !== undefined) {
          // A diagram contains several networks.
          // Create a new file for each network.
          const diagramFiles = createFilesFromDiagramObject(contents, file);

          // If any file ids already exist, give a new id
          for (let existingFile of [...currentFiles, ...newFiles]) {
            for (let diagramFile of diagramFiles) {
              if (existingFile.id === diagramFile.id) {
                diagramFile.id = id();
              }
            }
          }

          newFiles.push(...diagramFiles);
          continue;
        }
      } catch (e: any) {
        errors.push(createError(file, "invalid-json", e.message));
        continue;
      }
    } else if (format === "net") {
      contents = {
        network: readFiles[i],
        noModularResult: true,
      };
    } else {
      try {
        contents = parse(readFiles[i], undefined, true, false);
      } catch (e: any) {
        errors.push(createError(file, "parse-error", e.message));
        continue;
      }
    }

    if (!contents) {
      errors.push(createError(file, "invalid-format", "Could not parse file"));
      continue;
    }

    try {
      setIdentifiers(contents, format, storeIdentifier);
      newFiles.push(createFile(file, format, contents));
    } catch (e: any) {
      errors.push(createError(file, "invalid-format", e.message));
    }
  }

  return [newFiles, errors];
}

export function createFilesFromDiagramObject(
  json: any, // FIXME any
  file: any // FIXME any
) {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network) => network.nodes.length)
      .reduce((tot, b) => tot + b, 0) || 1;

  return json.networks.map((network) => {
    setIdentifiers(network, "json");

    return {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      fileName: file.name,
      name: network.name, // FIXME remove
      id: network.id, // FIXME remove
      format: "json",
      ...calcStatistics(network),
      ...network,
    };
  });
}

// FIXME any
export function calcStatistics(file: any) {
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

const stateOrNodeId = (node) => (node.stateId != null ? node.stateId : node.id);

export function setIdentifiers(network, format: string, identifier = "id") {
  const { nodes } = network;

  const getIdentifier = (node) => {
    if (identifier === "id") {
      return stateOrNodeId(node).toString();
    } else if (identifier === "name") {
      return node.name ?? stateOrNodeId(node).toString();
    }
  };

  if (format === "multilayer-expanded") {
    // Expanded multilayer networks must use the physical
    // node id, as the state ids are unique per layer.
    nodes.forEach((node) => (node.identifier = node.id.toString()));
  } else if (format === "json") {
    nodes.forEach((node) => {
      node.identifier = node.identifier ?? getIdentifier(node);
      // TODO: remove. Used only for example data.
      if (!Array.isArray(node.path)) {
        node.path = TreePath.toArray(node.path);
      }
    });
  } else if (format === "tree" || format === "ftree" || format === "stree") {
    nodes.forEach((node) => (node.identifier = getIdentifier(node)));
  } else if (format === "clu") {
    nodes.forEach((node) => {
      const id = stateOrNodeId(node);
      node.path = node.moduleId.toString();
      node.identifier = id.toString();
      node.name = node.id.toString();
    });
  }
}

export async function getLocalStorageFiles() {
  const network = await localforage.getItem("network");
  if (!network) {
    return;
  }

  const localStorageFiles = [];

  const acceptedKeys = [
    "ftree",
    "ftree_states",
    "clu",
    "clu_states",
    "json",
    "json_states",
  ];
  const extensions = {
    ftree: ".ftree",
    ftree_states: "_states.ftree",
    clu: ".clu",
    clu_states: "_states.clu",
    json: ".json",
    json_states: "_states.json",
  };

  for (let key of Object.keys(network)) {
    if (
      key === "timestamp" ||
      key === "name" ||
      key === "input" ||
      !acceptedKeys.includes(key) ||
      !network[key]
    ) {
      continue;
    }

    const contents =
      key === "json" || key === "json_states"
        ? JSON.stringify(network[key]) // TODO dan't stringify and then parse again
        : network[key];
    const extension = extensions[key];
    const filename = `${network.name ?? "network"}${extension}`;

    const blob = new Blob([contents], { type: "text/plain" });
    const file = new File([blob], filename, {
      type: "text/plain",
      lastModified: network.timestamp,
    });

    localStorageFiles.push(file);
  }

  return localStorageFiles;
}

export function mergeMultilayerFiles(file, files) {
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

  return newFiles;
}

export function expandMultilayerFile(file, files) {
  const layers = {};

  setIdentifiers(file, "multilayer-expanded");

  file.isExpanded = true;

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

  return newFiles;
}
