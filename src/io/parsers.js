import parseClu from "./parse-clu";
import parseTree from "./parse-tree";


export const parsers = {
  clu: parseClu,
  map: parseTree,
  tree: parseTree,
  ftree: parseTree,
};

export const validExtensions = Object.keys(parsers);

export const isValidExtension = ext => validExtensions.includes(ext);

export const getParser = ext => parsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
