import parseClu from "./parse-clu";
import parse from "./parse";


export const parsers = {
  clu: parseClu,
  map: parse,
  tree: parse,
  ftree: parse,
};

export const validExtensions = Object.keys(parsers);

export const isValidExtension = ext => validExtensions.includes(ext);

export const getParser = ext => parsers[ext];

export const acceptedFormats = validExtensions.map(ext => `.${ext}`).join(",");
