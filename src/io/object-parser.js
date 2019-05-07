// @flow
import id from "../lib/id";


type ObjectParser = (object: Object, name: string) => Network;

const parse: ObjectParser = (object, name) => ({
  id: id(),
  name,
  ...object,
});

const parseClu: ObjectParser = (object, name) => ({
  id: id(),
  name,
  nodes: object.nodes.map(node => ({ path: node.cluster.toString(), ...node })),
  codelength: object.codelength,
});

const objectParsers = {
  clu: parseClu,
  map: parse,
  tree: parse,
  ftree: parse,
};

export const validExtensions: string[] = Object.keys(objectParsers);

export const isValidExtension = (ext: string) => validExtensions.includes(ext);

export const getParser = (ext: string) => objectParsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
