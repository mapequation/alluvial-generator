import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { OPTION_KEYS, DiagramStore } from "../store/DiagramStore";
import TreePath from "../utils/TreePath";
import {
  ALLUVIAL_FORMAT,
  readAlluvialMetadata,
  SAVED_OPTION_KEYS,
  serializeDiagram,
  sortBySavedPosition,
} from "./alluvial-format";
import { parseAcceptedFiles } from "./parse-files";

const FORMATS = ["tree", "ftree", "stree", "clu", "json", "net", "zip"];

// Two small networks with two levels: modules 1, 2 (with sub-modules) and 3.
const TREE_A = `# v2.15.1
# ./Infomap a.net . -o tree
# started at 2026-01-01 00:00:00
# completed in 0.1 s
# codelength 2.5 bits
# relative codelength savings 10%
# flow model undirected
# path flow name node_id
1:1:1 0.2 "a" 1
1:1:2 0.1 "b" 2
1:2:1 0.1 "c" 3
2:1 0.2 "d" 4
2:2 0.1 "e" 5
3:1 0.2 "f" 6
3:2 0.1 "g" 7
`;
const TREE_B = `# path flow name node_id
1:1 0.3 "a" 1
1:2 0.1 "b" 2
2:1 0.2 "c" 3
2:2 0.1 "d" 4
3:1 0.2 "e" 5
3:2 0.1 "f" 6
`;

function file(name: string, text: string, type = "") {
  return new File([text], name, { type, lastModified: 0 });
}

async function load(files: File[]) {
  const [parsed, errors] = await parseAcceptedFiles(files, [], FORMATS, "id");
  expect(errors.filter((e) => !e.warning)).toEqual([]);
  return parsed;
}

async function editedStore() {
  const store = new DiagramStore({ height: 500, colorScheme: "Paired" });
  store.setNetworks(
    await load([file("a.tree", TREE_A), file("b.tree", TREE_B)])
  );
  store.setNetworkName(store.diagram.children[1].networkId, "second network");
  store.colorModuleIdsInAllNetworks();
  const [a] = store.diagram.children;
  store.expand(a.getModule("1")!);
  store.setModuleName(a.getModule("2")!, "Two");
  store.setModuleOrder([[a, [a.getModule("3")!]]]);
  store.setFontSize(11);
  store.setDropShadow(true);
  return store;
}

const SAVE = { generator: "test", saveId: "save1" };

function files(saved: { name: string; text: string }[]) {
  return saved.map(({ name, text }) => file(name, text, "application/json"));
}

describe("serializeDiagram", () => {
  it("writes the keys in the format's order", async () => {
    const store = await editedStore();
    const [first, second] = serializeDiagram(store, SAVE);
    expect(first.name).toBe("00_a.tree.json");
    expect(second.name).toBe("01_second_network.json");

    const a = JSON.parse(first.text);
    expect(Object.keys(a)).toEqual([
      "version",
      "args",
      "startedAt",
      "completedIn",
      "codelength",
      "relativeCodelengthSavings",
      "flowModel",
      "higherOrder",
      "name",
      "colors",
      "nodes",
      "alluvial",
    ]);
    expect(Object.keys(a.nodes[0])).toEqual([
      "path",
      "flow",
      "name",
      "id",
      "identifier",
      "highlightIndex",
      "moduleLevel",
    ]);
    expect(a.nodes[0].path).toEqual([1, 1, 1]);
    expect(a.alluvial).toEqual({
      format: ALLUVIAL_FORMAT,
      formatVersion: 1,
      generator: "test",
      diagram: {
        saveId: "save1",
        position: 0,
        numNetworks: 2,
        colorScheme: "Paired",
        options: store.getOptions(),
      },
      network: {
        moduleNames: { "2": "Two" },
        moduleOrder: ["3", "1:1", "1:2", "2"],
      },
    });
    expect(Object.keys(a.alluvial.diagram.options)).toEqual([
      ...SAVED_OPTION_KEYS,
    ]);
    expect(JSON.parse(second.text).alluvial.network).toEqual({});
    expect(first.text.endsWith("}")).toBe(true);
  });

  it("saves every store option except identifier and duration", () => {
    expect([...SAVED_OPTION_KEYS].sort()).toEqual(
      OPTION_KEYS.filter((k) => k !== "identifier" && k !== "duration").sort()
    );
  });

  it("encodes insignificant levels as stree strings", () => {
    expect(new TreePath("1;1;63;").toSavedPath()).toBe("1;1;63;");
    expect(new TreePath("1:1;63;").toSavedPath()).toBe("1:1;63;");
    expect(new TreePath("1:2:").toSavedPath()).toEqual([1, 2]);
    expect(new TreePath([3, 1]).toSavedPath()).toEqual([3, 1]);
    for (const path of ["1;1;63;", "1:1;63;"]) {
      const saved = new TreePath(path).toSavedPath() as string;
      expect(new TreePath(saved).toArray()).toEqual(
        new TreePath(path).toArray()
      );
    }
  });
});

describe("readAlluvialMetadata", () => {
  const block = (extra: object, diagram: object = {}) => ({
    name: "n",
    alluvial: {
      format: ALLUVIAL_FORMAT,
      formatVersion: 1,
      diagram: {
        saveId: "s",
        position: 0,
        numNetworks: 1,
        options: {},
        ...diagram,
      },
      ...extra,
    },
  });

  it("ignores files without a block or with another format", () => {
    expect(
      readAlluvialMetadata([
        { name: "a" },
        { name: "b", alluvial: { format: "x" } },
      ])
    ).toEqual({ networks: [undefined, undefined], warnings: [] });
  });

  it("warns for a newer or an invalid formatVersion", () => {
    const newer = block({ formatVersion: 2 });
    const invalid = block({ formatVersion: "1" });
    const { diagram, networks, warnings } = readAlluvialMetadata([
      newer,
      invalid,
    ]);
    expect(diagram).toBeUndefined();
    expect(networks).toEqual([undefined, undefined]);
    expect(warnings).toEqual([
      "n: saved by a newer version (formatVersion 2): options, module names and order were not restored",
      "n: the saved diagram block has no valid formatVersion: options, module names and order were not restored",
    ]);
  });

  it("restores the diagram block only for one complete save", () => {
    const a = block({}, { numNetworks: 2 });
    const b = block({}, { numNetworks: 2, position: 1 });
    const other = block({}, { numNetworks: 2, position: 1, saveId: "t" });
    expect(readAlluvialMetadata([a, b]).diagram).toEqual({ options: {} });
    expect(readAlluvialMetadata([a, other]).warnings).toEqual([
      "the files are from different saves: the saved diagram options were not restored",
    ]);
    expect(readAlluvialMetadata([a]).warnings).toEqual([
      "incomplete save: 1 of 2 networks: the saved diagram options were not restored",
    ]);
  });

  it("checks the options and the scheme", () => {
    const { diagram, warnings } = readAlluvialMetadata([
      block(
        {},
        {
          colorScheme: "toString",
          options: { height: -1, fontSize: 12, verticalAlign: "top", foo: 1 },
        }
      ),
    ]);
    expect(diagram).toEqual({ options: { fontSize: 12 } });
    expect(warnings).toEqual([
      "ignoring the saved option height (invalid value)",
      "ignoring the saved option verticalAlign (invalid value)",
      "ignoring the saved color scheme (unknown scheme)",
    ]);
  });

  it("keeps string module names and ids", () => {
    const { networks } = readAlluvialMetadata([
      block({
        network: { moduleNames: { "1": "x", "2": 3 }, moduleOrder: ["2", 1] },
      }),
    ]);
    expect(networks).toEqual([
      { moduleNames: { "1": "x" }, moduleOrder: ["2"] },
    ]);
  });
});

describe("sortBySavedPosition", () => {
  it("sorts the files of one save and leaves others alone", () => {
    const at = (position: number, saveId = "s") => ({
      name: `${position}`,
      alluvial: {
        format: ALLUVIAL_FORMAT,
        formatVersion: 1,
        diagram: { saveId, position, numNetworks: 3 },
      },
    });
    const shuffled = [at(2), at(0), at(1)];
    expect(sortBySavedPosition(shuffled).map((f) => f.name)).toEqual([
      "0",
      "1",
      "2",
    ]);
    const mixed = [at(2), at(0, "t"), at(1)];
    expect(sortBySavedPosition(mixed)).toEqual(mixed);
  });
});

describe("save and open", () => {
  it("restores the diagram from loose files and from a zip", async () => {
    const store = await editedStore();
    const saved = serializeDiagram(store, SAVE);

    const zip = new JSZip();
    for (const { name, text } of saved) zip.file(name, text);
    const bytes = await zip.generateAsync({ type: "arraybuffer" });

    for (const input of [
      files([...saved].reverse()),
      [new File([bytes], "diagram.zip", { type: "application/zip" })],
    ]) {
      const reloaded = new DiagramStore();
      const warnings = reloaded.openNetworks(await load(input));
      expect(warnings).toEqual([]);
      expect(reloaded.getOptions()).toEqual(store.getOptions());
      expect(reloaded.selectedSchemeName).toBe("Paired");
      expect(reloaded.highlightColors).toEqual(store.highlightColors);
      const ids = (s: DiagramStore) =>
        s.diagram.children.map((n) => n.children.map((m) => m.moduleId));
      expect(ids(reloaded)).toEqual(ids(store));
      expect(reloaded.diagram.children[0].isCustomSorted).toBe(true);
      expect(reloaded.diagram.children[0].getModule("2")!.name).toBe("Two");
      // the reload saves the same files
      expect(serializeDiagram(reloaded, SAVE)).toEqual(saved);
    }
  });

  it("still loads a saved file as plain Infomap JSON", async () => {
    const store = await editedStore();
    const [first] = serializeDiagram(store, SAVE);
    const [parsed] = await load(files([first]));
    const plain = new DiagramStore();
    plain.setNetworks([parsed]);
    expect(plain.diagram.children[0].children.length).toBeGreaterThan(0);
  });

  it("warns for saved modules that do not exist", async () => {
    const store = await editedStore();
    const saved = serializeDiagram(store, SAVE).map(({ name, text }) => {
      const value = JSON.parse(text);
      if (value.alluvial.network.moduleOrder) {
        value.alluvial.network.moduleOrder.unshift("9");
        value.alluvial.network.moduleNames["8"] = "gone";
      }
      return { name, text: JSON.stringify(value) };
    });
    const reloaded = new DiagramStore();
    expect(reloaded.openNetworks(await load(files(saved)))).toEqual([
      "a.tree: module 9 of the saved module order does not exist",
      "a.tree: module 8 of the saved module names does not exist",
    ]);
  });
});

describe("showBipartiteNodes (E19)", () => {
  it("hides the bipartite nodes when the store is built with the option off", async () => {
    const json = {
      bipartiteStartId: 3,
      nodes: [
        { path: [1, 1], flow: 0.25, id: 1 },
        { path: [1, 2], flow: 0.25, id: 3 },
        { path: [2, 1], flow: 0.25, id: 2 },
        { path: [2, 2], flow: 0.25, id: 4 },
      ],
    };
    const parsed = () => load([file("b.json", JSON.stringify(json))]);
    const hidden = new DiagramStore({ showBipartiteNodes: false });
    hidden.setNetworks(await parsed());
    const shown = new DiagramStore();
    shown.setNetworks(await parsed());
    shown.setShowBipartiteNodes(false);
    const flows = (s: DiagramStore) =>
      s.diagram.children[0].children.map((m) => m.flow);
    expect(flows(hidden)).toEqual(flows(shown));
    expect(flows(hidden)).toEqual([0.25, 0.25]);
  });
});
