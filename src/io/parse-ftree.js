// @flow
import id from "../lib/id";
import type { Module, Node, Row } from "./network-types";
import { expanded, parseNode } from "./parse-tree";

export type FTree = {
  +data: {
    +nodes: Node[],
    +modules: Module[],
    +meta: {
      id: string,
      +directed: boolean,
      +expanded: boolean
    }
  },
  +errors: string[]
};

const toStringOrDefault = (value, defaultValue = "") =>
  value ? value.toString() : defaultValue.toString();

const parseModulesSection = (row: Row): Module => ({
  path: row[1].toString(),
  exitFlow: +row[2],
  numEdges: +row[3],
  numChildren: +row[4],
  flow: +row[5] || 0,
  name: toStringOrDefault(row[6]),
  links: []
});

export default function parseFTree(rows: Row[]): FTree {
  const result = {
    data: {
      nodes: [],
      modules: [],
      meta: {
        id: id(),
        directed: true,
        expanded: false
      }
    },
    errors: []
  };

  const { nodes, modules, meta } = result.data;

  let i = 0;

  const isLinkSection = field => /^\*Links/i.test(field.toString());

  // 1. Parse nodes section
  for (; i < rows.length && !isLinkSection(rows[i][0]); i++) {
    const row = rows[i];

    if (row.length !== 4 && row.length !== 5) {
      result.errors.push(
        `Malformed ftree data: expected 4 or 5 fields, found ${row.length}.`
      );
      continue;
    }

    if (!meta.expanded && expanded(row)) {
      meta.expanded = true;
    }

    nodes.push(parseNode(row));
  }

  if (!nodes.length) {
    result.errors.push("No nodes data found!");
  }

  // 2. Get link type
  if (rows[i] && /(un)?directed/i.test(rows[i][1].toString())) {
    meta.directed = rows[i][1].trim().toLowerCase() === "directed";
    i++;
  } else {
    result.errors.push("Expected link type!");
  }

  // 3. Parse modules section
  for (; i < rows.length; i++) {
    const row = rows[i];

    // 3a. Parse link header
    if (isLinkSection(row[0])) {
      if (row.length < 5) {
        result.errors.push(
          `Malformed ftree link header: expected at least 5 fields, found ${
            row.length
          }.`
        );
        continue;
      }

      let module = parseModulesSection(row);
      modules.push(module);
    }
  }

  if (!modules.length) {
    result.errors.push("No link data found!");
  }

  return result;
}
