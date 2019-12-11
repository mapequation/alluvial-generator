// @flow
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Depth, { ALLUVIAL_ROOT, NETWORK_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";


export type VerticalAlign = "bottom" | "justify" | "top";

export type ModuleSize = "flow" | "nodes";

const differenceIndex = (array1, array2) => {
  let differenceIndex = 0;
  const minLength = Math.min(array1.length, array2.length);
  for (let i = 0; i < minLength; i++) {
    if (array1[i] === array2[i]) continue;
    differenceIndex = i;
    break;
  }
  return differenceIndex;
};

type GetNodeSize = (node: AlluvialNode) => number;

const getNodeSizeByPropForNetwork = ({ numLeafNodes }: NetworkRoot) => (property: string): GetNodeSize => {
  if (property === "flow") {
    return (node: AlluvialNode) => node.flow;
  } else if (property === "nodes") {
    return (node: AlluvialNode) => node.numLeafNodes / numLeafNodes;
  }
  return () => 0;
};

export default class AlluvialRoot extends AlluvialNodeBase {
  children: NetworkRoot[] = [];
  depth = ALLUVIAL_ROOT;

  constructor() {
    super(null, "", "root");
  }

  getNetworkRoot(networkId: string): ?NetworkRoot {
    return this.children.find(root => root.networkId === networkId);
  }

  addNetwork(network: Network) {
    const { nodes, id, codelength, name, moduleNames } = network;

    if (this.children.some(network => network.networkId === id)) {
      throw new Error(`Network with id ${id} already exists`);
    }

    const networkRoot = new NetworkRoot(this, id, name, codelength);

    if (moduleNames) {
      Module.customNames = new Map([...Module.customNames, ...moduleNames]);
    }

    const leafNodes = nodes.map(node => new LeafNode(node, networkRoot));
    networkRoot.createLeafNodeMap(leafNodes);

    leafNodes.forEach(node => node.add());
  }

  expandModule(moduleId: string, networkId: string) {
    const networkRoot = this.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return false;
    }

    const module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return false;
    }

    const leafNodes: LeafNode[] = Array.from(module.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const newModuleLevel = module.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(node => node.level <= newModuleLevel);
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
        `because some nodes are at level ${newModuleLevel - 1}`
      );
      return false;
    }

    leafNodes.forEach(node => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });

    return true;
  }

  regroupModule(moduleId: string, networkId: string) {
    const networkRoot = this.getNetworkRoot(networkId);
    if (!networkRoot) {
      console.warn(`No network id ${networkId}`);
      return false;
    }

    const module = networkRoot.getModule(moduleId);
    if (!module) {
      console.warn(`No module found with id ${moduleId} in network ${networkId}`);
      return false;
    }

    if (module.moduleLevel <= 1) {
      console.warn(`Module with id ${moduleId} is already at module level ${module.moduleLevel}`);
      return false;
    }

    const modules = module.getSiblings();

    const leafNodes = [].concat.apply(
      [],
      modules.map(module => [...module.leafNodes()])
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const newModuleLevel = module.moduleLevel - 1;

    leafNodes.forEach(node => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });

    return true;
  }

  updateLayout(
    height: number,
    streamlineFraction: number,
    moduleWidth: number,
    flowThreshold: number,
    verticalAlign: VerticalAlign = "bottom",
    marginExponent: number,
    moduleSize: ModuleSize = "flow",
    sortModulesBy: ModuleSize = "flow"
  ) {
    const numNetworks = this.numChildren;

    if (!numNetworks) return;

    const streamlineWidth = streamlineFraction * moduleWidth;
    const networkWidth = moduleWidth + streamlineWidth;
    const totalWidth = networkWidth * numNetworks - streamlineWidth;

    let x = 0;
    let y = height;

    const totalMargins = new Array(numNetworks).fill(0);
    const visibleFlows = new Array(numNetworks).fill(0);
    const visibleModules = new Array(numNetworks).fill(0);
    let networkIndex = 0;

    let getNodeSize = null;
    let moduleHeight = 0;
    let moduleMargin = 0;

    const moduleIsVisible = (module: AlluvialNode) => module.flow >= flowThreshold && module.isVisible;

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.forEachDepthFirstPreOrderWhile(
      node =>
        node.depth < Depth.MODULE ||
        (node.depth === Depth.MODULE && moduleIsVisible(node)) ||
        node.depth === Depth.HIGHLIGHT_GROUP,
      (node, i, nodes) => {
        if (node.depth === Depth.NETWORK_ROOT) {
          const getNodeSizeByProp = getNodeSizeByPropForNetwork(node);
          getNodeSize = getNodeSizeByProp(moduleSize);
          node.flowThreshold = flowThreshold;
          networkIndex = i;
          node.sortChildren(getNodeSizeByProp(sortModulesBy));
          if (i > 0) x += networkWidth;
          y = height;
        } else if (node.depth === Depth.MODULE && getNodeSize) {
          node.sortChildren();
          const margin =
            i + 1 < nodes.length
              ? 2 ** (marginExponent - 2 * differenceIndex(node.path, nodes[i + 1].path))
              : 0;
          const nodeSize = getNodeSize(node);
          moduleHeight = nodeSize * height;
          y -= moduleHeight;
          node.margin = margin;
          node.layout = { x, y, width: moduleWidth, height: moduleHeight };
          y -= moduleMargin = margin;
          totalMargins[networkIndex] += margin;
          visibleFlows[networkIndex] += nodeSize;
          visibleModules[networkIndex]++;
        } else if (node.depth === Depth.HIGHLIGHT_GROUP && getNodeSize) {
          if (i === 0) {
            y += moduleHeight + moduleMargin;
          }
          const groupHeight = getNodeSize(node) * height;
          y -= groupHeight;
          node.layout = { x, y, width: moduleWidth, height: groupHeight };
          if (i + 1 === nodes.length) {
            y -= moduleMargin;
          }
        }
      }
    );

    const maxTotalMargin = Math.max(...totalMargins);
    let usableHeight = height - maxTotalMargin;

    const maxMarginFractionOfHeight = 0.5;
    const marginFractionOfHeight = maxTotalMargin / height;

    if (marginFractionOfHeight > maxMarginFractionOfHeight) {
      // Reduce margins to below 50% of vertical space
      // Use moduleMarginScale such that
      //   moduleMarginScale * maxTotalMargin / height == maxMarginFractionOfHeight
      const moduleMarginScale = (maxMarginFractionOfHeight * height) / maxTotalMargin;

      this.forEachDepthFirstWhile(
        node => node.depth <= Depth.MODULE,
        node => {
          if (node.depth === Depth.MODULE) {
            node.margin *= moduleMarginScale;
          }
        }
      );

      const scaledTotalMargin = maxTotalMargin * moduleMarginScale;
      usableHeight = height - scaledTotalMargin;
    }

    if (verticalAlign === "justify") {
      let totalMargin = maxTotalMargin;
      let visibleFlow = Math.max(...visibleFlows);
      let missingFlow = 0;
      let missingMargin = 0;
      let numMargins = 0;

      this.forEachDepthFirstWhile(
        node =>
          node.depth < Depth.MODULE ||
          (node.depth === Depth.MODULE && moduleIsVisible(node)),
        (node, i) => {
          if (node.depth === Depth.NETWORK_ROOT) {
            totalMargin = totalMargins[i];
            numMargins = visibleModules[i] - 1;
            visibleFlow = visibleFlows[i];
            missingFlow = 1 - visibleFlow;
            missingMargin = missingFlow * usableHeight;
          } else if (node.depth === Depth.MODULE && node.margin > 0) {
            node.margin *= maxTotalMargin / totalMargin;
            if (numMargins > 0) {
              node.margin += missingMargin / numMargins;
            }
          }
        }
      );
    }

    this.forEachDepthFirstWhile(
      node => node.depth <= Depth.BRANCH,
      node => {
        if (node.depth === Depth.BRANCH) {
          node.sortChildren(flowThreshold);
        }
      }
    );

    x = 0;
    y = height;

    getNodeSize = null;

    this.forEachDepthFirstPostOrderWhile(
      node =>
        node.depth !== Depth.MODULE ||
        (node.depth === Depth.MODULE && moduleIsVisible(node)),
      node => {
        if (node.depth === Depth.STREAMLINE_NODE) {
          if (!getNodeSize) {
            const network = node.getAncestor(NETWORK_ROOT);
            if (!network) {
              console.error("Streamline node has no NetworkRoot parent");
              return;
            }
            getNodeSize = getNodeSizeByPropForNetwork(network)(moduleSize);
          }
          const nodeHeight = getNodeSize(node) * usableHeight;
          y -= nodeHeight;
          node.layout = { x, y, width: moduleWidth, height: nodeHeight };
        } else if (node.depth === Depth.BRANCH && getNodeSize) {
          let branchHeight = getNodeSize(node) * usableHeight;
          node.layout = { x, y, width: moduleWidth, height: branchHeight };
          if (node.isLeft) {
            y += branchHeight;
          }
        } else if (node.depth === Depth.HIGHLIGHT_GROUP && getNodeSize) {
          node.layout = { x, y, width: moduleWidth, height: getNodeSize(node) * usableHeight };
        } else if (node.depth === Depth.MODULE && getNodeSize) {
          node.layout = { x, y, width: moduleWidth, height: getNodeSize(node) * usableHeight };
          y -= node.margin;
        } else if (node.depth === Depth.NETWORK_ROOT) {
          node.layout = { x, y: 0, width: moduleWidth, height };
          x += networkWidth;
          y = height;
          getNodeSize = null;
        } else if (node.depth === Depth.ALLUVIAL_ROOT) {
          node.layout = { x: 0, y: 0, width: totalWidth, height };
        }
      }
    );
  }
}
