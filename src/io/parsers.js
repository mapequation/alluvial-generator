import parseClu from "./parse-clu";
import parseFTree from "./parse-ftree";
import parseMap from "./parse-map";
import parseTree from "./parse-tree";


export const parsers = {
  clu: parseClu,
  map: parseMap,
  tree: parseTree,
  ftree: parseFTree,
};

export const validExtensions = Object.keys(parsers);

export const isValidExtension = ext => validExtensions.includes(ext);

export const getParser = ext => parsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
