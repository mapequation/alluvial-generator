import id from "../../../utils/id";
import type { NetworkFile } from "../types";
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";

export function mergeMultilayerFiles(file: NetworkFile, files: NetworkFile[]) {
  if (!file.isMultilayer) {
    throw new Error("File is not multilayer");
  }

  const aggregated = Object.assign({}, file);
  aggregated.name = file.filename;
  aggregated.id = file.originalId!;
  aggregated.originalId = undefined;
  aggregated.nodes = [];
  aggregated.layerId = undefined;

  let firstIndex = files.length;

  const parts = files.filter((f, i) => {
    const part = f.isMultilayer && f.originalId === file.originalId;
    if (part) {
      firstIndex = Math.min(firstIndex, i);
    }
    return part;
  });

  for (const part of parts) {
    aggregated.nodes.push(...part.nodes!);
  }

  Object.assign(aggregated, {
    ...calcStatistics(aggregated.nodes),
    isExpanded: false,
  });

  setIdentifiers(aggregated.nodes, "tree");

  const newFiles = files.filter((f) => f.originalId !== file.originalId);
  newFiles.splice(firstIndex, 0, aggregated);

  return newFiles;
}

export function expandMultilayerFile(file: NetworkFile, files: NetworkFile[]) {
  if (!file.isMultilayer) {
    throw new Error("File is not multilayer");
  }

  const layers: { [key: number]: NetworkFile } = {};

  setIdentifiers(file.nodes, "multilayer-expanded");

  file.isExpanded = true;

  file.nodes.forEach((node) => {
    if (!layers[node.layerId!]) {
      const layerId = node.layerId!;
      const layer = (layers[layerId] = Object.assign({}, file));
      layer.id = id();
      layer.originalId = file.id;

      layer.lastModified = file.lastModified;
      layer.layerId = layerId;
      layer.size = file.size;
      layer.nodes = [];

      layer.name = (() => {
        // FIXME where is this used?
        // Possibly from multilayer as json where
        // the layer name has been added manually
        const layerName = file.layers?.find((l) => l.id === layerId)?.name;
        return layerName ?? `Layer ${layerId}`;
      })();
    }

    layers[node.layerId!].nodes.push(node);
  });

  for (const layer of Object.values(layers)) {
    Object.assign(layer, {
      ...calcStatistics(layer.nodes),
      isExpanded: true,
    });
  }

  const index = files.indexOf(file);
  const newFiles = [...files];
  newFiles.splice(index, 1, ...Object.values(layers));

  return newFiles;
}
