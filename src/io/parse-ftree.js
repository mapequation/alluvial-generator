// @flow
import id from "../lib/id";


export type Node = {
    path: string,
    flow: number,
    name: string,
    node: number,
    stateNode?: number,
};

export type Link = {
    source: number,
    target: number,
    flow: number,
};

export type Module = {
    id: string,
    path: string,
    exitFlow: number,
    numEdges: number,
    numChildren: number,
    flow: number,
    name: string,
    links: Array<Link>,
};

const expanded = row => row.length === 5;

const parse = (row: Array<any>): Node => ({
    path: row[0].toString(),
    flow: row[1],
    name: row[2].toString(),
    node: row[row.length - 1],
});

const parseExpanded = (row: Array<any>): Node => ({
    ...parse(row),
    stateNode: row[3],
});

const parseNode = (row: Array<any>): Node => expanded(row) ? parseExpanded(row) : parse(row);

const createParseModulesSection = id => (row: Array<any>): Module => ({
    id,
    path: row[1].toString(),
    exitFlow: row[2],
    numEdges: row[3],
    numChildren: row[4],
    flow: row[5],
    name: row[6],
    links: [],
});

const parseLink = (row: Array<number>): Link => ({
    source: row[0],
    target: row[1],
    flow: row[2],
});

export type FTree = {
    data: {
        nodes: Array<Node>,
        modules: Array<Module>,
        meta: {
            id: string,
            directed: boolean,
            expanded: boolean,
        },
    },
    errors: Array<string>,
};

export default function parseFTree(rows: Array<any>): FTree {
    const result = {
        data: {
            nodes: [],
            modules: [],
            meta: {
                id: id(),
                directed: true,
                expanded: false,
            },
        },
        errors: [],
    };

    const { nodes, modules, meta } = result.data;

    let i = 0;

    const isLinkSection = field => /^\*Links/i.test(field.toString());

    // 1. Parse nodes section
    for (; i < rows.length && !isLinkSection(rows[i][0]); i++) {
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

    const parseModulesSection = createParseModulesSection(meta.id);

    let module: ?Module = null;

    // 3. Parse modules section
    for (; i < rows.length; i++) {
        const row = rows[i];

        // 3a. Parse link header
        if (isLinkSection(row[0])) {
            if (row.length < 5) {
                result.errors.push(`Malformed ftree link header: expected at least 5 fields, found ${row.length}.`);
                continue;
            }

            module = parseModulesSection(row);
            modules.push(module);

            // 3b. Parse link data
        } else if (module) {
            /*
            if (row.length < 3) {
                result.errors.push(`Malformed ftree link data: expected at least 3 fields, found ${row.length}.`);
                continue;
            }

            module.links.push(parseLink(row));
            */
        }
    }

    if (!modules.length) {
        result.errors.push("No link data found!");
    }

    return result;
}
