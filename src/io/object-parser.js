import id from "../lib/id";

const setNodeIdentifiers = (object, identifier) => {
  const id = (node) =>
    (node.stateId !== null ? node.stateId : node.id).toString();
  const name = (node) => node.name;

  let nodeId = null;

  if (identifier === "name") nodeId = name;
  else if (identifier === "id") nodeId = id;
  else return object;

  for (let node of object.nodes) {
    node.identifier = nodeId(node);
  }
  return object;
};

const parse = (
  object,
  name,
  nodeIdentifier = "name",
  isMultilayer = false
) => {
  if (isMultilayer) {
    // TODO remove support for 0.x
    object.nodes.forEach((node) => (node.stateId = null));
  }

  setNodeIdentifiers(object, nodeIdentifier);

  return {
    id: id(),
    name,
    ...object,
  };
};

const parseClu = (object, name, nodeIdentifier = "name") => {
  setNodeIdentifiers(object, nodeIdentifier);

  const numNodes = object.nodes.length;
  const normalizedWeight = 1 / (numNodes || 1);

  return {
    id: id(),
    name,
    nodes: object.nodes.map((node) => ({
      path: node.module.toString(),
      id: node.id,
      name: node.stateId ? node.stateId.toString() : node.id.toString(),
      ...node,
      flow: node.flow || normalizedWeight,
    })),
    codelength: object.codelength,
    moduleNames: null,
  };
};

const parseMultilevelTree = (object, name, nodeIdentifier = "name") => {
  const nodesPerLayer = {};

  object.nodes.forEach((node) => {
    node.stateId = null;

    if (nodesPerLayer[node.layerId] == null) {
      nodesPerLayer[node.layerId] = [];
    }

    nodesPerLayer[node.layerId].push(node);
  });

  return Object.entries(nodesPerLayer).map(([layerId, nodes]) =>
    parse(
      { codelength: object.codelength, nodes },
      `${name} layer ${layerId}`,
      nodeIdentifier
    )
  );
};

const objectParsers = {
  clu: parseClu,
  map: parse,
  tree: parse,
  ftree: parse,
  stree: parse,
  multilevelTree: parseMultilevelTree, // FIXME: this is not a valid file extension
};

export const validExtensions = Object.keys(objectParsers);

export const isValidExtension = (ext) => validExtensions.includes(ext);

export const getParser = (ext) => objectParsers[ext];

export const acceptedFormats = validExtensions
  .map((ext) => `.${ext}`)
  .join(",");
