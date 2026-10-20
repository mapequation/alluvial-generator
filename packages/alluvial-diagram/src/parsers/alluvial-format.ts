// Saved diagrams: "alluvial network files", formatVersion 1.
//
// A saved diagram is one Infomap-JSON file per network (loose or in a zip).
// Each file is a superset of `infomap -o json` output: Infomap's top-level
// keys are passed through, and the file adds `name`, `colors` (the palette)
// and three node keys (`identifier`, `highlightIndex`, `moduleLevel`) that
// the loader already reads. Everything else goes in one namespaced block,
// `alluvial`, that other readers ignore:
//
//   "alluvial": {
//     "format": "alluvial-network", "formatVersion": 1, "generator": "...",
//     "diagram": {saveId, position, numNetworks, colorScheme, options},
//     "network": {moduleNames?, moduleOrder?}
//   }
//
// The diagram part is the same in every file of one save (tied together by
// `saveId`); the network part belongs to the file's network. The Python port
// (alluvial-py, `alluvial.io.alluvial_format`) writes the same text byte for
// byte and restores the same state.
import JSZip from "jszip";
import type Network from "../alluvial/Network";
import type LeafNode from "../alluvial/LeafNode";
import { COLOR_SCHEMES, SchemeName } from "../schemes";
import type { DiagramStore } from "../store/DiagramStore";

export const ALLUVIAL_FORMAT = "alluvial-network";
export const ALLUVIAL_FORMAT_VERSION = 1;

/** Infomap's top-level keys that a saved file copies from its input, in this order. */
export const PASS_THROUGH_KEYS = [
  "version",
  "args",
  "startedAt",
  "completedIn",
  "codelength",
  "relativeCodelengthSavings",
  "directed",
  "flowModel",
  "higherOrder",
  "stateLevel",
  "bipartiteStartId",
] as const;

/** The store options a saved diagram carries (the store's options except `identifier` and `duration`), in order. */
export const SAVED_OPTION_KEYS = [
  "height",
  "marginExponent",
  "zeroMargins",
  "moduleWidth",
  "streamlineFraction",
  "streamlineThreshold",
  "streamlineOpacity",
  "flowThreshold",
  "defaultHighlightColor",
  "verticalAlign",
  "moduleSize",
  "sortModulesBy",
  "showModuleId",
  "showModuleNames",
  "multilineModuleNames",
  "showNetworkNames",
  "aggregateStateNames",
  "titleCaseModuleNames",
  "hierarchicalModules",
  "hierarchicalModuleOffset",
  "hierarchicalModuleOpacity",
  "dropShadow",
  "fontSize",
  "networkFontSize",
  "adaptiveFontSize",
  "showBipartiteNodes",
] as const;

export type SavedOptionKey = (typeof SAVED_OPTION_KEYS)[number];
export type SavedOptions = Pick<DiagramStore, SavedOptionKey>;

export type AlluvialDiagramMetadata = {
  saveId: string;
  position: number;
  numNetworks: number;
  colorScheme?: string;
  options?: Partial<Record<SavedOptionKey, unknown>>;
};

export type AlluvialNetworkMetadata = {
  moduleNames?: { [moduleId: string]: string };
  moduleOrder?: string[];
};

export type AlluvialMetadata = {
  format: typeof ALLUVIAL_FORMAT;
  formatVersion: number;
  generator?: string;
  diagram?: AlluvialDiagramMetadata;
  network?: AlluvialNetworkMetadata;
};

/** One file of a saved diagram. */
export type SavedFile = { name: string; text: string };

/** What `readAlluvialMetadata` found in a set of files, ready to restore. */
export type AlluvialRestore = {
  // The diagram options and scheme, when the files form one complete save.
  diagram?: { colorScheme?: SchemeName; options: Partial<SavedOptions> };
  // One entry per file (undefined for a file without a valid v1 block).
  networks: (AlluvialNetworkMetadata | undefined)[];
  warnings: string[];
};

const NOT_RESTORED = "options, module names and order were not restored";
const DIAGRAM_NOT_RESTORED = "the saved diagram options were not restored";

const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const bool = (v: unknown) => typeof v === "boolean";
const string = (v: unknown) => typeof v === "string";
const oneOf =
  (...values: string[]) =>
  (v: unknown) =>
    typeof v === "string" && values.includes(v);

// The values a restore accepts (the Python port checks the same rules).
const OPTION_RULES: Record<SavedOptionKey, (v: unknown) => boolean> = {
  height: (v) => finite(v) && v > 0,
  marginExponent: finite,
  zeroMargins: bool,
  moduleWidth: (v) => finite(v) && v > 0,
  streamlineFraction: (v) => finite(v) && v >= 0,
  streamlineThreshold: (v) => finite(v) && v >= 0,
  streamlineOpacity: finite,
  flowThreshold: (v) => finite(v) && v >= 0 && v < 1,
  defaultHighlightColor: string,
  verticalAlign: oneOf("bottom", "justify"),
  moduleSize: oneOf("flow", "nodes"),
  sortModulesBy: oneOf("flow", "nodes", "nodeId", "highlightIndex"),
  showModuleId: bool,
  showModuleNames: bool,
  multilineModuleNames: bool,
  showNetworkNames: bool,
  aggregateStateNames: bool,
  titleCaseModuleNames: bool,
  hierarchicalModules: oneOf("none", "outline", "shadow"),
  hierarchicalModuleOffset: finite,
  hierarchicalModuleOpacity: finite,
  dropShadow: bool,
  fontSize: finite,
  networkFontSize: finite,
  adaptiveFontSize: bool,
  showBipartiteNodes: bool,
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function randomSaveId() {
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}

function safeName(name: unknown) {
  return String(name).replace(/[^A-Za-z0-9._-]/g, "_");
}

function savedNode(leaf: LeafNode) {
  const node: Record<string, unknown> = {
    path: leaf.treePath.toSavedPath(),
    flow: leaf.inputFlow,
  };
  if (leaf.name != null) node.name = leaf.name;
  node.id = leaf.nodeId;
  if (leaf.stateId != null) node.stateId = leaf.stateId;
  if (leaf.layerId != null) node.layerId = leaf.layerId;
  if (leaf.metadata != null && Object.keys(leaf.metadata).length) {
    node.metadata = leaf.metadata;
  }
  node.identifier = leaf.identifier;
  node.highlightIndex = leaf.highlightIndex;
  node.moduleLevel = leaf.moduleLevel;
  return node;
}

function networkMetadata(network: Network): AlluvialNetworkMetadata {
  const out: AlluvialNetworkMetadata = {};
  const moduleNames: { [moduleId: string]: string } = {};
  let named = false;
  for (const module of network.children) {
    if (module.name) {
      moduleNames[module.moduleId] = module.name;
      named = true;
    }
  }
  if (named) out.moduleNames = moduleNames;
  if (network.isCustomSorted) {
    out.moduleOrder = network.children.map((module) => module.moduleId);
  }
  return out;
}

/** One file of a saved diagram before it is turned into text. */
export type SavedFileData = { name: string; data: Record<string, unknown> };

/**
 * The data of `serializeDiagram`, one object per network in diagram order,
 * before `JSON.stringify`. The objects share the palette, the options and
 * the input files' `modules`/`layers` with the store: do not mutate them.
 * `DiagramStore.moveNetwork` rebuilds the diagram from them.
 */
export function serializeDiagramData(
  store: DiagramStore,
  {
    generator = "@mapequation/alluvial-diagram",
    saveId = randomSaveId(),
  }: { generator?: string; saveId?: string } = {}
): SavedFileData[] {
  const networks = store.diagram.children;
  const colors = [...store.highlightColors];
  const options = store.getOptions();

  return networks.map((network, position) => {
    const file: any = store.networks.find((f) => f.id === network.networkId);
    const out: Record<string, unknown> = {};

    for (const key of PASS_THROUGH_KEYS) {
      if (file?.[key] != null) out[key] = file[key];
    }
    out.name = network.name;
    if (colors.length) out.colors = colors;
    out.nodes = network.inputLeafNodes.map(savedNode);
    if (file?.modules != null) out.modules = file.modules;
    if (file?.layers != null) out.layers = file.layers;

    const alluvial: AlluvialMetadata = {
      format: ALLUVIAL_FORMAT,
      formatVersion: ALLUVIAL_FORMAT_VERSION,
      generator,
      diagram: {
        saveId,
        position,
        numNetworks: networks.length,
        colorScheme: store.selectedSchemeName,
        options,
      },
      network: networkMetadata(network),
    };
    out.alluvial = alluvial;

    const name = `${String(position).padStart(2, "0")}_${safeName(
      network.name
    )}.json`;
    return { name, data: out };
  });
}

/**
 * Save the store's diagram as one Infomap-JSON text per network, in diagram
 * order, named `NN_<network name>.json`. Loading the texts with
 * `parseAcceptedFiles` and `DiagramStore.openNetworks` restores the diagram:
 * network order and names, the palette and every node's colour and module
 * level, module names, custom module orders, the options and the scheme.
 *
 * Text: `JSON.stringify(value, null, 2)`, no trailing newline.
 */
export function serializeDiagram(
  store: DiagramStore,
  options: { generator?: string; saveId?: string } = {}
): SavedFile[] {
  return serializeDiagramData(store, options).map(({ name, data }) => ({
    name,
    text: JSON.stringify(data, null, 2),
  }));
}

/** A zip of the saved files (entries in the given order, no directories). */
export function zipFiles(files: SavedFile[]): Promise<Blob> {
  const zip = new JSZip();
  for (const { name, text } of files) {
    zip.file(name, text);
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

type BlockOf = { alluvial?: unknown; name?: unknown };

function readDiagramBlock(raw: unknown): AlluvialDiagramMetadata | undefined {
  if (
    !isObject(raw) ||
    !string(raw.saveId) ||
    !Number.isInteger(raw.position) ||
    !Number.isInteger(raw.numNetworks)
  ) {
    return undefined;
  }
  return raw as AlluvialDiagramMetadata;
}

function readNetworkBlock(raw: unknown): AlluvialNetworkMetadata {
  const out: AlluvialNetworkMetadata = {};
  if (!isObject(raw)) return out;
  if (isObject(raw.moduleNames)) {
    const moduleNames: { [moduleId: string]: string } = {};
    for (const [moduleId, name] of Object.entries(raw.moduleNames)) {
      if (typeof name === "string") moduleNames[moduleId] = name;
    }
    out.moduleNames = moduleNames;
  }
  if (Array.isArray(raw.moduleOrder)) {
    out.moduleOrder = raw.moduleOrder.filter(
      (moduleId: unknown): moduleId is string => typeof moduleId === "string"
    );
  }
  return out;
}

// The diagram blocks of files that form one complete save, or the reason why
// they do not (undefined: no file has a diagram block).
function completeSave(diagrams: (AlluvialDiagramMetadata | undefined)[]): {
  diagrams?: AlluvialDiagramMetadata[];
  warning?: string;
} {
  const valid = diagrams.filter(
    (d): d is AlluvialDiagramMetadata => d !== undefined
  );
  if (valid.length === 0) return {};
  if (
    valid.length < diagrams.length ||
    valid.some((d) => d.saveId !== valid[0].saveId)
  ) {
    return {
      warning: `the files are from different saves: ${DIAGRAM_NOT_RESTORED}`,
    };
  }
  const n = valid.length;
  const positions = new Set(valid.map((d) => d.position));
  if (
    valid.some((d) => d.numNetworks !== n) ||
    positions.size !== n ||
    valid.some((d) => d.position < 0 || d.position >= n)
  ) {
    return {
      warning: `incomplete save: ${n} of ${valid[0].numNetworks} networks: ${DIAGRAM_NOT_RESTORED}`,
    };
  }
  return { diagrams: valid };
}

function v1Blocks(files: BlockOf[], warnings?: string[]) {
  return files.map((file) => {
    const block = file.alluvial;
    if (!isObject(block) || block.format !== ALLUVIAL_FORMAT) return undefined;
    const version = block.formatVersion;
    if (!Number.isInteger(version) || version < 1) {
      warnings?.push(
        `${file.name}: the saved diagram block has no valid formatVersion: ${NOT_RESTORED}`
      );
      return undefined;
    }
    if (version > ALLUVIAL_FORMAT_VERSION) {
      warnings?.push(
        `${file.name}: saved by a newer version (formatVersion ${version}): ${NOT_RESTORED}`
      );
      return undefined;
    }
    return block;
  });
}

/**
 * Read and check the `alluvial` blocks of the files of one diagram, in their
 * final order. The network blocks apply per file; the diagram block (options
 * and scheme) only when every file has a valid v1 block of the same save and
 * the positions are a permutation of 0..n-1 for n files. Problems give
 * warnings, never errors: a file without a usable block loads as plain
 * Infomap JSON.
 */
export function readAlluvialMetadata(files: BlockOf[]): AlluvialRestore {
  const warnings: string[] = [];
  const blocks = v1Blocks(files, warnings);
  const networks = blocks.map((block) =>
    block ? readNetworkBlock(block.network) : undefined
  );
  const save = completeSave(
    blocks.map((block) => (block ? readDiagramBlock(block.diagram) : undefined))
  );
  if (save.warning) warnings.push(save.warning);
  if (!save.diagrams) return { networks, warnings };

  const { colorScheme, options: rawOptions } = save.diagrams[0];
  const options: Record<string, unknown> = {};
  if (isObject(rawOptions)) {
    for (const key of SAVED_OPTION_KEYS) {
      if (!(key in rawOptions)) continue;
      const value = rawOptions[key];
      if (OPTION_RULES[key](value)) {
        options[key] = value;
      } else {
        warnings.push(`ignoring the saved option ${key} (invalid value)`);
      }
    }
  }
  const diagram: AlluvialRestore["diagram"] = {
    options: options as Partial<SavedOptions>,
  };
  if (colorScheme !== undefined) {
    if (
      typeof colorScheme === "string" &&
      Object.prototype.hasOwnProperty.call(COLOR_SCHEMES, colorScheme)
    ) {
      diagram.colorScheme = colorScheme as SchemeName;
    } else {
      warnings.push("ignoring the saved color scheme (unknown scheme)");
    }
  }
  return { diagram, networks, warnings };
}

/**
 * The files in saved order, when they form one complete save (see
 * `readAlluvialMetadata`); otherwise the files unchanged. Returns a new array.
 */
export function sortBySavedPosition<T extends BlockOf>(files: T[]): T[] {
  const blocks = v1Blocks(files);
  const save = completeSave(
    blocks.map((block) => (block ? readDiagramBlock(block.diagram) : undefined))
  );
  if (!save.diagrams) return [...files];
  const position = new Map(
    files.map((file, i) => [file, save.diagrams![i].position])
  );
  return [...files].sort((a, b) => position.get(a)! - position.get(b)!);
}
