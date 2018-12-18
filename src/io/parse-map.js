// @flow
import id from "../lib/id";
import type { Node, Row } from "./network-types";

export type Map = {
  +data: {
    +nodes: Node[],
    +meta: {
      id: string,
      +directed: boolean
    }
  },
  +errors: string[]
};

const parseNode = (row: Row): Node => ({
  path: row[0].toString(),
  name: row[1].toString(),
  flow: +row[2]
});

export default function parseMap(rows: Row[]): Map {
  const result = {
    data: {
      nodes: [],
      meta: {
        id: id(),
        directed: true
      }
    },
    errors: []
  };

  const { nodes, meta } = result.data;

  let i = 0;

  if (rows[i] && /(un)?directed/i.test(rows[i][0].toString())) {
    meta.directed = rows[i][0].trim().toLowerCase() === "directed";
    i++;
  } else {
    result.errors.push("Expected link type!");
  }

  let numModules = 0;

  // skip modules section
  if (rows[i] && /\*modules/i.test(rows[i][0].toString())) {
    numModules = +rows[i][1];
    i += numModules + 1;
  } else {
    result.errors.push("Expected number of modules");
  }

  let numNodes = 0;

  if (rows[i] && /\*nodes/i.test(rows[i][0].toString())) {
    numNodes = +rows[i][1];
    i++;
  } else {
    result.errors.push("Expected number of nodes");
  }

  for (; i < rows.length && numNodes-- > 0; i++) {
    const row = rows[i];

    if (row.length !== 3) {
      result.errors.push(
        `Malformed map data: expected 3 fields, found ${row.length}.`
      );
      continue;
    }

    nodes.push(parseNode(row));
  }

  if (!nodes.length) {
    result.errors.push("No nodes data found!");
  }

  return result;
}
