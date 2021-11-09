import id from "../utils/id";

const stateOrNodeId = (node) => (node.stateId != null ? node.stateId : node.id);

const setNodeIdentifiers = (object, identifier) => {
  const id = (node) => stateOrNodeId(node).toString();
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
  nodeIdentifier = "name"
  /*, isMultilayer = false */
) => {
  // if (isMultilayer) {
  //   // TODO remove support for 0.x
  //   object.nodes.forEach((node) => (node.stateId = null));
  // }
  setNodeIdentifiers(object, nodeIdentifier);

  return {
    id: id(),
    name,
    ...object,
    nodes: object.nodes.map((node) => ({
      ...node,
      path: node.path.join(":"), // TODO remove,
    })),
  };
};

const parseClu = (object, name, nodeIdentifier = "name") => {
  setNodeIdentifiers(object, nodeIdentifier);

  return {
    id: id(),
    name,
    ...object,
    nodes: object.nodes.map((node) => ({
      ...node,
      path: node.moduleId.toString(),
      name: stateOrNodeId(node).toString(),
    })),
    //moduleNames: null,
  };
};

// const parseMultilevelTree = (object, name, nodeIdentifier = "name") => {
//   const nodesPerLayer = {};

//   object.nodes.forEach((node) => {
//     node.stateId = null;

//     if (nodesPerLayer[node.layerId] == null) {
//       nodesPerLayer[node.layerId] = [];
//     }

//     nodesPerLayer[node.layerId].push(node);
//   });

//   return Object.entries(nodesPerLayer).map(([layerId, nodes]) =>
//     parse(
//       { codelength: object.codelength, nodes },
//       `${name} layer ${layerId}`,
//       nodeIdentifier
//     )
//   );
// };

const objectParsers = {
  clu: parseClu,
  tree: parse,
  ftree: parse,
  //stree: parse,
  //multilevelTree: parseMultilevelTree,
  json: (json) => json,
};

export const validExtensions = Object.keys(objectParsers);

export const isValidExtension = (ext) => validExtensions.includes(ext);

export const getParser = (ext) => objectParsers[ext];

export const acceptedFormats = validExtensions
  .map((ext) => `.${ext}`)
  .join(",");
