// @flow
import id from "../lib/id";
import type { Node, Row } from "./network-types";

export type Clu = {
  +data: {
    +nodes: Node[],
    +meta: {
      id: string
    }
  },
  +errors: string[]
};

const expanded = (row: Row): boolean => row.length === 4;

const parse = (row: Row): Node => ({
  node: +row[0],
  name: row[0].toString(),
  path: row[1].toString(),
  flow: +row[2]
});

const parseExpanded = (row: Row): Node => ({
  ...parse(row),
  stateNode: +row[0],
  node: +row[3]
});

export const parseNode = (row: Row): Node =>
  expanded(row) ? parseExpanded(row) : parse(row);

export default function parseClu(rows: Row[]): Clu {
  const result = {
    data: {
      nodes: [],
      meta: {
        id: id()
      }
    },
    errors: []
  };

  const { nodes } = result.data;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (row.length !== 3 && row.length !== 4) {
      result.errors.push(
        `Malformed clu data: expected 3 or 4 fields, found ${row.length}.`
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
