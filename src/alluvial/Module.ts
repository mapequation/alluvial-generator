import PriorityQueue from "../utils/PriorityQueue";
import TreePath from "../utils/TreePath";
import AlluvialNodeBase from "./AlluvialNode";
import { MODULE } from "./Depth";
import type HighlightGroup from "./HighlightGroup";
import { NOT_HIGHLIGHTED } from "./HighlightGroup";
import type LeafNode from "./LeafNode";
import type Network from "./Network";
import { LEFT, Side } from "./Side";
import { js_div } from "../utils/entropy";

type CustomName = {
  name: string;
  flow: number;
};

export default class Module extends AlluvialNodeBase<HighlightGroup, Network> {
  static customNames: Map<string, CustomName> = new Map(); // FIXME should this really be static?
  readonly depth = MODULE;
  readonly path: number[] = [];
  readonly moduleId: string;
  margin: number = 0;
  index: number;
  readonly moduleLevel: number = 1;

  constructor(parent: Network, moduleId: string, moduleLevel: number = 1) {
    super(parent, parent.networkId, `${parent.networkId}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
    const customName = Module.customNames.get(this.id);
    this._name = customName ? [customName.name] : this.subModuleNames();
    this.index = parent.addChild(this) - 1;
  }

  private _name: string[] | null = null;

  get name() {
    // @ts-ignore
    return this._name;
  }

  set name(name: string | null) {
    if (!name || name === "") {
      Module.customNames.delete(this.id);
      this._name = this.subModuleNames();
    } else {
      Module.customNames.set(this.id, { name, flow: this.flow });
      this._name = [name];
    }
  }

  get largestLeafNodes() {
    const compare = (a: LeafNode, b: LeafNode) => b.flow - a.flow;
    return new PriorityQueue<LeafNode>(5, compare, this.leafNodes()).map(
      (node) => node.name
    );
  }

  get x1() {
    return this.x;
  }

  get x2() {
    return this.x + this.width;
  }

  get namePosition() {
    const { x1, x2, y, height } = this;
    const padding = 5;
    const width = 15;
    const textOffset = width + padding;

    const x = this.parent.isFirstChild
      ? x1 - textOffset
      : this.parent.isLastChild
      ? x2 + textOffset
      : (x1 + x2) / 2;

    return {
      x,
      y: y + height / 2,
    };
  }

  get textAnchor() {
    return this.parent.isFirstChild
      ? "end"
      : this.parent.isLastChild
      ? "start"
      : null;
  }

  get idPosition() {
    const { x1, x2, y, height } = this;
    return {
      x: (x1 + x2) / 2,
      y: y + height / 2,
    };
  }

  get networkName() {
    return this.parent?.name ?? "";
  }

  get networkCodelength() {
    return this.parent?.codelength ?? 0;
  }

  get isVisible() {
    return this.flow >= this.flowThreshold && this.flow > 0;
  }

  get hasSubmodules() {
    return this.moduleLevel < this.maxModuleLevel;
  }

  get isTopModule() {
    return this.moduleLevel === 1;
  }

  get isLeafModule() {
    return !this.hasSubmodules;
  }

  get parentIndex() {
    return this.parent?.children.indexOf(this) ?? 0;
  }

  private get maxModuleLevel() {
    // FIXME optimize
    let maxModuleLevel = this.moduleLevel;
    for (const node of this.leafNodes()) {
      maxModuleLevel = Math.max(maxModuleLevel, node.level - 1);
    }
    return maxModuleLevel;
  }

  private get flowThreshold() {
    return this.parent?.flowThreshold ?? 0;
  }

  private get siblings(): Module[] {
    if (!this.parent) return [];
    const modules = this.parent.children;

    const moduleLevel = this.moduleLevel - 1;
    if (moduleLevel < 1) return modules;

    const parentPath = TreePath.ancestorAtLevel(this.moduleId, moduleLevel);
    return modules.filter((module) => parentPath.isAncestor(module.moduleId));
  }

  getGroup(highlightIndex: number, insignificant: boolean) {
    return this.children.find(
      (group) =>
        group.highlightIndex === highlightIndex &&
        group.insignificant === insignificant
    );
  }

  expand() {
    const leafNodes: LeafNode[] = Array.from(this.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = this.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(
      (node) => node.level <= newModuleLevel
    );
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
          `because some nodes are at level ${newModuleLevel - 1}`
      );
      return;
    }

    const network = this.parent;
    if (!network) return;

    network.isCustomSorted = false;

    leafNodes.forEach((node) => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });
  }

  regroup() {
    if (this.moduleLevel <= 1) {
      console.warn(
        `Module with id ${this.moduleId} is already at module level ${this.moduleLevel}`
      );
      return;
    }

    const modules = this.siblings;

    const leafNodes: LeafNode[] = [].concat.apply(
      [],
      // @ts-ignore FIXME
      modules.map((module) => [...module.leafNodes()])
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const network = this.parent;
    if (!network) return;

    network.isCustomSorted = false;

    const newModuleLevel = this.moduleLevel - 1;

    leafNodes.forEach((node) => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });
  }

  setColor(highlightIndex: number) {
    const leafNodes = [...this.leafNodes()];

    leafNodes.forEach((node) => {
      node.highlightIndex = highlightIndex;
      node.update();
    });
  }

  removeColors() {
    this.setColor(NOT_HIGHLIGHTED);
  }

  moveUp() {
    const index = this.parentIndex;

    const network = this.parent;
    if (!network) return;

    if (index === network.children.length - 1) {
      console.warn(`Can't move module up because it is already at the top`);
      return;
    }

    network.isCustomSorted = true;
    network.moveToIndex(index, index + 1);
  }

  moveDown() {
    const index = this.parentIndex;

    if (index === 0) {
      console.warn(
        `Can't move module down because it is already at the bottom`
      );
      return;
    }

    const network = this.parent;
    if (!network) return;

    network.isCustomSorted = true;
    network.moveToIndex(index, index - 1);
  }

  getSimilarModules(side: Side, numModules = 5, threshold = 1e-6) {
    type Item = { module: Module; similarity: number };
    const modules = new PriorityQueue(
      numModules,
      (a: Item, b: Item) => b.similarity - a.similarity
    );

    type NodeId = LeafNode["identifier"];
    type NodeDistribution = { [nodeId: NodeId]: number };
    const getNodeDistribution = (
      module: Module
    ): [NodeDistribution, Set<NodeId>] => {
      const nodes: { [nodeId: string]: number } = {};
      for (const node of module.leafNodes()) {
        nodes[node.identifier] = node.flow;
      }
      return [nodes, new Set(Object.keys(nodes))];
    };

    const [thisNodes, thisIds] = getNodeDistribution(this);

    for (let module of this.connectedModules(side)) {
      if (!module.isVisible) continue;

      const [otherNodes, otherIds] = getNodeDistribution(module);

      const ids = new Set([...thisIds, ...otherIds]);

      const X: [number[], number[]] = [Array(ids.size), Array(ids.size)];

      let i = 0;
      for (const id of ids) {
        X[0][i] = thisNodes[id] ?? 0;
        X[1][i] = otherNodes[id] ?? 0;
        ++i;
      }

      const similarity = 1 - js_div(X[0], X[1], true);

      if (similarity > threshold) {
        modules.push({ module, similarity });
      }
    }

    return modules.toArray();
  }

  private *connectedModules(side: Side) {
    const moduleIds = new Set();

    for (let group of this) {
      const branch = side === LEFT ? group.left : group.right;

      for (let streamlineNode of branch) {
        const module = streamlineNode.opposite?.getAncestor(
          MODULE
        ) as Module | null;

        if (module && !moduleIds.has(module.moduleId)) {
          moduleIds.add(module.moduleId);
          yield module;
        }
      }
    }
  }

  *rightStreamlines() {
    for (let group of this) {
      for (let streamlineNode of group.right) {
        const module = streamlineNode.opposite?.getAncestor(
          MODULE
        ) as Module | null;

        if (!module?.isVisible) {
          continue;
        }

        if (streamlineNode.link) yield streamlineNode.link;
      }
    }
  }

  private subModuleNames() {
    const names = Array.from(Module.customNames.entries())
      .filter(([id, ..._]) => id.startsWith(this.id))
      .sort((a, b) => a[1].flow - b[1].flow)
      .map(([_, { name }]) => name);
    return names.length ? names : null;
  }
}
