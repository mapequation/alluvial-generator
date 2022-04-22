import type { Module as InfomapModule } from "@mapequation/infomap";
import * as d3 from "d3";
import type { NetworkFile } from "../components/LoadNetworks";
import { moveItem } from "../utils/array";
import TreePath from "../utils/TreePath";
import AlluvialNodeBase, { Layout } from "./AlluvialNode";
import { NETWORK } from "./Depth";
import Diagram from "./Diagram";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";
import StreamlineNode from "./StreamlineNode";

type ModuleLink = {
  target: string;
  flow: number;
};

export type Categorical = {
  kind: "categorical";
  counts: { category: string; count: number }[];
};

export type Real = {
  kind: "real";
  values: { node: string; value: number }[];
  min: number;
  max: number;
  median: number;
  mean: number;
  variance: number;
  boxBounds: number[];
  pdfBounds: number[];
};

export default class Network extends AlluvialNodeBase<Module, Diagram> {
  readonly depth = NETWORK;
  name: string;
  isCustomSorted = false;
  readonly layerId: number | undefined; // When representing each layer as a network
  readonly codelength: number;
  readonly directed: boolean;
  private nodesByIdentifier: Map<string, LeafNode> = new Map();
  private readonly modulesById: Map<string, Module> = new Map();
  private streamlineNodesById: Map<string, StreamlineNode> = new Map();
  infomapModulesByPath: Map<string, InfomapModule> = new Map();
  moduleLinks: Map<string, ModuleLink[]> = new Map();

  constructor(
    parent: Diagram,
    { name, id, codelength, layerId, modules, directed }: NetworkFile
  ) {
    super(parent, id, id);
    parent.addChild(this);
    this.name = name;
    this.codelength = codelength ?? 0;
    this.layerId = layerId;
    this.directed = directed ?? false;

    if (modules) {
      this.infomapModulesByPath = new Map(
        modules.map((module) => [module.path.join(":"), module])
      );

      this.moduleLinks = createLinkMap(modules, this.directed);
    }
  }

  get isMultilayer() {
    return this.leafNodes()?.next()?.value.layerId != null;
  }

  get isHigherOrder() {
    return this.isMultilayer || this.leafNodes()?.next()?.value.stateId != null;
  }

  get haveMetadata() {
    return this.leafNodes()?.next()?.value.metadata != null;
  }

  get metadata() {
    const meta: { [key: string]: Categorical | Real } = {};

    if (!this.haveMetadata) {
      return meta;
    }

    for (const node of this.leafNodes()) {
      for (const [key, value] of Object.entries(node.metadata ?? {})) {
        if (!(key in meta)) {
          if (typeof value === "number") {
            meta[key] = {
              kind: "real",
              values: [],
              min: Infinity,
              max: -Infinity,
              median: 0,
              mean: 0,
              variance: 0,
              boxBounds: [],
              pdfBounds: [],
            };
          } else {
            meta[key] = {
              kind: "categorical",
              counts: [],
            };
          }
        }

        if (typeof value === "number") {
          const entry = meta[key] as Real;
          entry.values.push({ node: node.id, value });
          entry.mean += value;
          entry.variance += value * value; // Placeholder for variance
          entry.min = Math.min(entry.min, value);
          entry.max = Math.max(entry.max, value);
        } else {
          const entry = meta[key] as Categorical;
          if (!entry.counts.some((c) => c.category === value)) {
            entry.counts.push({ category: value, count: 0 });
          }
          entry.counts.find((c) => c.category === value)!.count++;
        }
      }
    }

    for (const value of Object.values(meta)) {
      if (value.kind === "real") {
        const entry = value as Real;
        entry.values.sort((a, b) => a.value - b.value);
        const N = entry.values.length || 1;
        entry.mean /= N;
        // Var(X) = E[X^2] - E[X]^2
        entry.variance =
          entry.variance / Math.max(N - 1, 1) - entry.mean * entry.mean;

        entry.pdfBounds = [
          entry.min,
          entry.mean - 2 * entry.variance,
          entry.mean - entry.variance,
          entry.mean + entry.variance,
          entry.mean + 2 * entry.variance,
          entry.max,
        ];

        entry.median =
          d3.quantileSorted(entry.values, 0.5, (d) => d.value) ?? 0;

        const q1 = d3.quantileSorted(entry.values, 0.25, (d) => d.value) ?? 0;
        const q3 = d3.quantileSorted(entry.values, 0.75, (d) => d.value) ?? 0;
        const iqr = q3 - q1;
        entry.boxBounds = [
          entry.min,
          Math.max(q1 - 1.5 * iqr, entry.min),
          q1,
          q3,
          Math.min(q3 + 1.5 * iqr, entry.max),
          entry.max,
        ];
      } else if (value.kind === "categorical") {
        const entry = value as Categorical;
        entry.counts.sort((a, b) => b.count - a.count);
      }
    }

    return meta;
  }

  get namePosition() {
    return {
      x: this.x + this.width / 2,
      y: this.height + 15 + 5,
    };
  }

  get visibleChildren() {
    return this.children.filter((module) => module.isVisible);
  }

  get hierarchicalChildren() {
    return [...this.tree.visitBreadthFirst()];
  }

  get tree() {
    const root = new TreeNode();

    for (const module of this.children) {
      if (!module.isVisible) {
        continue;
      }

      let parent = root;
      const path = new TreePath(module.path);

      for (
        let moduleLevel = 1;
        moduleLevel <= module.moduleLevel;
        ++moduleLevel
      ) {
        const parentPath = path.ancestorAtLevelAsString(moduleLevel);

        if (!parent.has(parentPath)) {
          const isLeaf = moduleLevel === module.moduleLevel;
          parent = parent.createChild(parentPath, moduleLevel, isLeaf);
        } else {
          parent = parent.get(parentPath)!;
        }
      }

      parent?.addChild(module);
    }

    return root;
  }

  get flowThreshold() {
    return this.parent?.flowThreshold ?? 0;
  }

  static create(parent: Diagram, network: NetworkFile) {
    return new Network(parent, network);
  }

  // FIXME use Infomap type
  addNodes(nodes: any[]) {
    this.nodesByIdentifier = new Map();

    const leafNodes = nodes.map((node) => {
      const leafNode = new LeafNode(node, this);
      this.nodesByIdentifier.set(leafNode.identifier, leafNode);
      return leafNode;
    });

    leafNodes.forEach((node) => node.add());
  }

  addChild(module: Module) {
    const length = super.addChild(module);
    this.modulesById.set(module.moduleId, module);
    return length;
  }

  removeChild(module: Module) {
    const found = super.removeChild(module);
    this.modulesById.delete(module.moduleId);
    return found;
  }

  getModule(moduleId: string): Module | null {
    return this.modulesById.get(moduleId) ?? null;
  }

  getNeighbor(side: Side): Network | null {
    const root = this.parent;

    if (root) {
      const networkIndex = root.children.findIndex(
        (network) => network.networkId === this.networkId
      );

      const neighborNetworkIndex = networkIndex + side;

      if (
        networkIndex > -1 &&
        neighborNetworkIndex > -1 &&
        neighborNetworkIndex < root.children.length
      ) {
        return root.children[neighborNetworkIndex];
      }
    }

    return null;
  }

  getLeafNode(identifier: string): LeafNode | null {
    return this.nodesByIdentifier.get(identifier) ?? null;
  }

  getStreamlineNode(id: string) {
    return this.streamlineNodesById.get(id);
  }

  setStreamlineNode(id: string, node: StreamlineNode) {
    this.streamlineNodesById.set(id, node);
  }

  removeStreamlineNode(id: string) {
    this.streamlineNodesById.delete(id);
  }

  moveToIndex(fromIndex: number, toIndex: number) {
    moveItem(this.children, fromIndex, toIndex);
  }

  getLinks(streamlineThreshold: number = 0) {
    return Array.from(this.rightStreamlines())
      .filter((link) => link.avgHeight > streamlineThreshold)
      .sort((a, b) =>
        a.highlightIndex !== b.highlightIndex
          ? a.highlightIndex - b.highlightIndex
          : b.avgHeight - a.avgHeight
      );
  }

  private *rightStreamlines() {
    for (let module of this) {
      // Skip if left module is below threshold
      if (!module.isVisible) {
        continue;
      }

      yield* module.rightStreamlines();
    }
  }
}

export type HierarchicalModule = TreeNode | Module;

class TreeNode extends Layout {
  children: HierarchicalModule[] = [];
  childPathMap = new Map<string, TreeNode>();
  maxModuleLevel: number = 1;
  y = Infinity;
  private maxY = -Infinity;
  private maxHeight = -Infinity;

  constructor(
    public path: string = "root",
    public moduleLevel: number = 1,
    public isLeaf: boolean = false,
    private parent?: TreeNode
  ) {
    super();

    if (parent) {
      parent.children.push(this);
      parent.childPathMap.set(path, this);
      this.updateMaxModuleLevel(moduleLevel);
    }
  }

  has(path: string) {
    return this.childPathMap.has(path);
  }

  get(path: string) {
    return this.childPathMap.get(path);
  }

  createChild(path: string, moduleLevel: number, isLeaf: boolean): TreeNode {
    return new TreeNode(path, moduleLevel, isLeaf, this);
  }

  *visitBreadthFirst(): Iterable<HierarchicalModule> {
    let queue = this.children;

    while (queue.length) {
      const node = queue.shift()!;

      if (node instanceof TreeNode) {
        if (!node.isLeaf) yield node;
        queue.push(...node.children);
      } else {
        yield node;
      }
    }
  }

  addChild(module: Module) {
    if (!this.isLeaf || !this.parent) {
      throw new Error("Module added to non-leaf TreeNode");
    }

    this.parent.updateLayout(module);
    this.children.push(module);
  }

  private updateMaxModuleLevel(moduleLevel: number) {
    if (moduleLevel > this.maxModuleLevel) {
      this.maxModuleLevel = moduleLevel;
    }
    this.parent?.updateMaxModuleLevel(moduleLevel);
  }

  private updateLayout(module: Module) {
    this.x = module.x;
    this.width = module.width;
    this.y = Math.min(this.y, module.y);

    if (module.y > this.maxY) {
      this.maxY = module.y;
      this.maxHeight = module.height;
      this.height = Math.max(
        this.height,
        Math.abs(this.y - module.y) + module.height
      );
    } else {
      this.height = Math.max(
        this.height,
        Math.abs(this.y - this.maxY) + this.maxHeight
      );
    }

    this.parent?.updateLayout(module);
  }
}

function createLinkMap(modules: InfomapModule[], directed: boolean = false) {
  const linkMap = new Map<string, ModuleLink[]>();

  const addDirectedLink = (source: string, target: string, flow: number) => {
    if (!linkMap.has(source)) {
      linkMap.set(source, []);
    }
    linkMap.get(source)?.push({ target, flow });
  };

  const addLink = (source: string, target: string, flow: number) => {
    addDirectedLink(source, target, flow);
    if (!directed) {
      addDirectedLink(target, source, flow);
    }
  };

  for (const module of modules) {
    const moduleId = module.path.join(":");
    const parent = module.path[0] === 0 ? "" : moduleId + ":";

    module.links?.forEach(({ source, target, flow }) =>
      addLink(parent + source, parent + target, flow)
    );
  }

  return linkMap;
}
