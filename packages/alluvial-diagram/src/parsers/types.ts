import { Module } from "@mapequation/infomap";
import type { AlluvialMetadata } from "./alluvial-format";

export type Format =
  | "json"
  | "clu"
  | "tree"
  | "ftree"
  | "stree"
  | "multilayer-expanded"
  | "net";

export type Node = {
  id: number;
  flow: number;
  stateId?: number;
  layerId?: number;
  name?: string;
  identifier?: string;
  path: string | number[];
  moduleId?: number;
  highlightIndex?: number;
  moduleLevel?: number;
};

export type NetworkFile = {
  id: string;
  format: Format;
  filename: string;
  flowDistribution?: { [key: number]: number };
  // File
  name: string;
  size: number;
  lastModified: number;
  // Tree
  nodes: Node[];
  isStateNetwork?: boolean;
  numTopModules?: number;
  numLevels?: number;
  cluLevel?: number;
  codelength?: number;
  // Infomap header (tree files and JSON), passed through by serializeDiagram
  version?: string;
  args?: string;
  startedAt?: string;
  completedIn?: number;
  relativeCodelengthSavings?: number;
  flowModel?: string;
  higherOrder?: boolean;
  stateLevel?: boolean;
  // Infomap
  network?: string;
  modules?: Module[];
  numTrials?: number;
  directed?: boolean;
  twoLevel?: boolean;
  haveModules: boolean;
  // Multilayer
  isExpanded?: boolean;
  isMultilayer?: boolean;
  bipartiteStartId?: number;
  numLayers?: number;
  layerId?: number;
  originalId?: string;
  layers?: { id: number; name: string }[]; // FIXME
  // Highlight colors: a palette that the nodes' highlightIndex refers to, or
  // true when each node has a color (see DiagramStore.checkColors).
  colors?: string[] | boolean;
  // The metadata block of a saved diagram (see alluvial-format.ts); unknown
  // shapes are checked by readAlluvialMetadata.
  alluvial?: AlluvialMetadata;
};
