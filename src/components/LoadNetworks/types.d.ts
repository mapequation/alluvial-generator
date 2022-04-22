import { Module } from "@mapequation/infomap";

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
  codelength?: number;
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
  numLayers?: number;
  layerId?: number;
  originalId?: string;
  layers?: { id: number; name: string }[]; // FIXME
};
