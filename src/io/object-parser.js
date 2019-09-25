// @flow
import id from "../lib/id";


type ObjectParser = (object: Object, name: string) => Network;

const setNodeNameToId = (object) => {
  for (let node of object.nodes) {
    const id = node.stateId !== null ? node.stateId : node.id;
    node.name = id.toString();
  }
  return object;
};

const parse: ObjectParser = (object, name, useNodeIdAsName = false) => {
  if (useNodeIdAsName) {
    setNodeNameToId(object);
  }

  return ({
    id: id(),
    name,
    ...object
  });
};

const parseClu: ObjectParser = (object, name, useNodeIdAsName = false) => {
  if (useNodeIdAsName) {
    setNodeNameToId(object);
  }

  const numNodes = object.nodes.length;
  const normalizedWeight = 1 / (numNodes || 1);

  return {
    id: id(),
    name,
    nodes: object.nodes.map(node => ({
      path: node.module.toString(),
      id: node.id,
      name: node.stateId ? node.stateId.toString() : node.id.toString(),
      ...node,
      flow: node.flow || normalizedWeight
    })),
    codelength: object.codelength
  };
};

const objectParsers = {
  clu: parseClu,
  map: parse,
  tree: parse,
  ftree: parse
};

export const validExtensions: string[] = Object.keys(objectParsers);

export const isValidExtension = (ext: string) => validExtensions.includes(ext);

export const getParser = (ext: string) => objectParsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
