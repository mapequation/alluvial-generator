// @ts-nocheck
import id from "../../../utils/id";
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";

// FIXME any
export function mergeMultilayerFiles(file: any, files: any[]) {
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

// FIXME any
export function expandMultilayerFile(file: any, files: any[]) {
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
