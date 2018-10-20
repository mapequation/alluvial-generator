// @flow
type Row = string[];

export type Node = {
  +path: string,
  +flow: number,
  +name: string,
  +node: number,
  +stateNode?: number
};

export type Link = {
  +source: number,
  +target: number,
  +flow: number
};

export type Module = {
  +path: string,
  +exitFlow: number,
  +numEdges: number,
  +numChildren: number,
  +flow: number,
  +name: string,
  +links: Link[]
};

export type FTree = {
  +data: {
    +nodes: Node[],
    +modules: Module[],
    +meta: {
      +directed: boolean,
      +expanded: boolean
    }
  },
  +errors: string[]
};

const expanded = row => row.length === 5;

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

const parseNode = (row: Row): Node =>
  expanded(row) ? parseExpanded(row) : parse(row);

const parseModulesSection = (row: Row): Module => ({
  path: row[1].toString(),
  exitFlow: +row[2],
  numEdges: +row[3],
  numChildren: +row[4],
  flow: +row[5],
  name: row[6].toString(),
  links: []
});

export default function parseFTree(rows: Row[]): FTree {
  const result = {
    data: {
      nodes: [],
      modules: [],
      meta: {
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
