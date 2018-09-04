/**
 * @file This file deals with parsing data in the
 * [FTree format]{@link http://www.mapequation.org/code.html#FTree-format}
 * to an object representation.
 * The data should be split into lines and fields.
 *
 * @author Anton Eriksson
 */
import TreePath from "../lib/treepath";


const expanded = row => row.length === 5;

const parse = row => ({
    path: new TreePath(row[0]),
    flow: row[1],
    name: row[2].toString(),
    node: row[row.length - 1],
});

const parseExpanded = row => ({
    ...parse(row),
    stateNode: row[3],
});

const parseNode = row => expanded(row) ? parseExpanded(row) : parse(row);

const parseLinkSection = row => ({
    path: new TreePath(row[1]),
    exitFlow: row[2],
    numEdges: row[3],
    numChildren: row[4],
    flow: row[5],
    name: row[6],
    links: [],
});

const parseLink = row => ({
    source: row[0],
    target: row[1],
    flow: row[2],
});

/**
 * Parse ftree data to object.
 *
 * The input can optionally have the Modules extension to the ftree format.
 *
 * @example
 *  // Input example
 *  [
 *      ["*Modules", 4], // optional section
 *      ["1", 0.5, "ModuleName 1", 0.4],
 *      // ...
 *      ["*Nodes", 10] // optional header
 *      ["1:1:1", 0.0564732, "Name 1", 29],
 *      ["1:1:2", 0.0066206, "Name 2", 286],
 *      ["1:1:3", 0.0025120, "Name 3", 146],
 *      ["1:1:4", 0.0024595, "Name 4", 155],
 *      // ...
 *      ["*Links", "directed"],
 *      ["*Links", "root", 0, 68, 208],
 *      [2, 1, 0.000107451],
 *      [1, 2, 0.0000830222],
 *      [3, 1, 0.00000900902],
 *      // ...
 *  ]
 *
 *
 * @example
 *  // Return value structure
 *  {
 *      data: {
 *          nodes: [
 *              { path, flow, name, stateNode?, node },
 *              // ...
 *          ],
 *          modules: [
 *              {
 *                  path,
 *                  name, // optional
 *                  exitFlow,
 *                  numEdges,
 *                  numChildren,
 *                  modules: [
 *                      { source, target, flow },
 *                      // ...
 *                  ],
 *              },
 *              // ...
 *          ],
 *          meta: {
 *              directed,
 *              expanded,
 *          },
 *      },
 *      errors: [],
 *  }
 *
 * @param {Array[]} rows ftree-file as array (rows) of arrays (fields)
 * @return {Object}
 */
export default function parseFTree(rows) {
    const result = {
        data: {
            nodes: [],
            modules: [],
            meta: {
                directed: true,
                expanded: false,
            },
        },
        errors: [],
    };

    const { nodes, modules, meta } = result.data;

    let i = 0;

    // 1. Parse nodes section
    // ftree-files has sections of *Links following the nodes data
    for (; i < rows.length && !/\*Links/i.test(rows[i][0].toString()); i++) {
        const row = rows[i];

        if (row.length !== 4 && row.length !== 5) {
            result.errors.push(`Malformed ftree data: expected 4 or 5 fields, found ${row.length}.`);
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

    let section = null;

    // 3. Parse modules section
    for (; i < rows.length; i++) {
        const row = rows[i];

        // 3a. Parse link header
        if (/^\*Links/i.test(row[0].toString())) {
            if (row.length < 5) {
                result.errors.push(`Malformed ftree link header: expected at least 5 fields, found ${row.length}.`);
                continue;
            }

            section = parseLinkSection(row)
            modules.push(section);

            // 3b. Parse link data
        } else if (section) {
            /*
            if (row.length < 3) {
                result.errors.push(`Malformed ftree link data: expected at least 3 fields, found ${row.length}.`);
                continue;
            }

            section.links.push(parseLink(row));
            */
        }
    }

    if (!modules.length) {
        result.errors.push("No link data found!");
    }

    return result;
}