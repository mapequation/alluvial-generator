// @flow
import id from "../lib/id";
import type { Node, Row } from "./network-types";

export type Tree = {
  +data: {
    +nodes: Node[],
    +meta: {
      id: string,
      +expanded: boolean
    }
  },
  +errors: string[]
};

export const expanded = (row: Row) => row.length === 5;

const parse = (row: Row): Node => ({
  path: row[0].toString(),
  flow: +row[1],
  name: row[2].toString(),
  node: +row[row.length - 1]
});

const parseExpanded = (row: Row): Node => ({
  ...parse(row),
  stateNode: +row[3]
});

export const parseNode = (row: Row): Node =>
  expanded(row) ? parseExpanded(row) : parse(row);

export default function parseTree(rows: Row[]): Tree {
  const result = {
    data: {
      nodes: [],
      meta: {
        id: id(),
        expanded: false
      }
    },
    errors: []
  };

  const { nodes, meta } = result.data;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row.length !== 4 && row.length !== 5) {
      result.errors.push(
        `Malformed tree data: expected 4 or 5 fields, found ${row.length}.`
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

  return result;
}
