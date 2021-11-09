import { parse } from "@mapequation/infomap/parser";
import type { Extension } from "@mapequation/infomap/parser";
import streeParser from "./stree-parser";

export function getParserForExtension(ext: Extension | "json" | "stree") {
  if (ext === "json") {
    return JSON.parse;
  }

  if (ext === "stree") {
    return streeParser;
  }

  if (ext === "clu" || ext === "tree" || ext === "ftree") {
    return parse;
  }

  return null;
}
