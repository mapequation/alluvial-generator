// @flow
import id from "../lib/id";


type ObjectParser = (object: Object, name: string, nodeIdentifier: string) => Network;

const setNodeIdentifiers = (object, identifier) => {
  const id = (node) => (node.stateId !== null ? node.stateId : node.id).toString();
  const name = (node) => node.name;

  let nodeId = null;

  if (identifier === "name")
    nodeId = name;
  else if (identifier === "id")
    nodeId = id;
  else
    return object;

  for (let node of object.nodes) {
    node.identifier = nodeId(node);
  }
  return object;
};

const parse: ObjectParser = (object, name, nodeIdentifier = "name", isMultiplex = false) => {
  if (isMultiplex) {
    object.nodes.forEach(node => node.stateId = null);
  }

  setNodeIdentifiers(object, nodeIdentifier);

  return ({
    id: id(),
    name,
    ...object
  });
};

const parseClu: ObjectParser = (object, name, nodeIdentifier = "name") => {
  setNodeIdentifiers(object, nodeIdentifier);

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
    codelength: object.codelength,
    moduleNames: null
  };
};

const objectParsers = {
  clu: parseClu,
  map: parse,
  tree: parse,
  ftree: parse,
  stree: parse
};

export const validExtensions: string[] = Object.keys(objectParsers);

export const isValidExtension = (ext: string) => validExtensions.includes(ext);

export const getParser = (ext: string) => objectParsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
