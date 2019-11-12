// @flow
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Depth, { ALLUVIAL_ROOT, NETWORK_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";
import type { Side } from "./Side";


export type VerticalAlign = "bottom" | "justify" | "top";

export type ModuleSize = "flow" | "nodes";

export default class AlluvialRoot extends AlluvialNodeBase {
  children: NetworkRoot[] = [];
  depth = ALLUVIAL_ROOT;

  constructor() {
    super(null, "", "root");
  }

  getNetworkRoot(networkId: string): ?NetworkRoot {
    return this.children.find(root => root.networkId === networkId);
  }

  hasNetwork(networkId: string): boolean {
    return this.children.some(network => network.networkId === networkId);
  }

  getNeighborNetwork(networkId: string, side: Side): ?NetworkRoot {
    const networkIndex = this.children.findIndex(networkRoot => networkRoot.networkId === networkId);
    if (networkIndex === -1) return;
    const neighborNetworkIndex = networkIndex + side;
    if (
      neighborNetworkIndex < 0 ||
      neighborNetworkIndex === this.children.length
    )
      return;
    return this.children[neighborNetworkIndex];
  }

  get networkIds(): string[] {
    return this.children.map(networkRoot => networkRoot.networkId);
  }

  getOppositeNode(node: LeafNode, side: Side): ?LeafNode {
    const networkRoot = this.getNeighborNetwork(node.networkId, side);
    if (!networkRoot) return;

    return networkRoot.getLeafNode(node.identifier);
  }

  updateLayout(
    height: number,
    streamlineFraction: number,
    moduleWidth: number,
    flowThreshold: number,
    verticalAlign: VerticalAlign = "bottom",
    marginExponent: number,
    moduleSize: ModuleSize = "flow"
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

    const getNodeSizeForNetwork = ({ numLeafNodes }: NetworkRoot) => (node: AlluvialNode): number => {
      if (moduleSize === "flow") {
        return node.flow;
      } else if (moduleSize === "nodes") {
        return node.numLeafNodes / numLeafNodes;
      }
      return 0;
    };

    let getNodeSize = null;
    let moduleHeight = 0;
    let moduleMargin = 0;

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.forEachDepthFirstPreOrderWhile(
      node =>
        node.depth < Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= flowThreshold) ||
        node.depth === Depth.HIGHLIGHT_GROUP,
      (node, i, nodes) => {
        switch (node.depth) {
          case Depth.NETWORK_ROOT:
            getNodeSize = getNodeSizeForNetwork(node);
            node.flowThreshold = flowThreshold;
            networkIndex = i;
            node.sortChildren();
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            if (!getNodeSize) {
              console.error("getNodeSize was not set!");
              return;
            }
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
            break;
          case Depth.HIGHLIGHT_GROUP:
            if (!getNodeSize) {
              console.error("getNodeSize was not set!");
              return;
            }
            if (i === 0) {
              y += moduleHeight + moduleMargin;
            }
            const groupHeight = getNodeSize(node) * height;
            y -= groupHeight;
            node.layout = { x, y, width: moduleWidth, height: groupHeight };
            if (i + 1 === nodes.length) {
              y -= moduleMargin;
            }
            break;
          default:
            break;
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
          (node.depth === Depth.MODULE && node.flow >= flowThreshold),
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
        (node.depth === Depth.MODULE && node.flow >= flowThreshold),
      node => {
        switch (node.depth) {
          case Depth.ALLUVIAL_ROOT:
            node.layout = { x: 0, y: 0, width: totalWidth, height };
            break;
          case Depth.NETWORK_ROOT:
            node.layout = { x, y: 0, width: moduleWidth, height };
            x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            if (!getNodeSize) {
              console.error("getNodeSize was not set!");
              return;
            }
            node.layout = { x, y, width: moduleWidth, height: getNodeSize(node) * usableHeight };
            y -= node.margin;
            break;
          case Depth.HIGHLIGHT_GROUP:
            if (!getNodeSize) {
              console.error("getNodeSize was not set!");
              return;
            }
            node.layout = { x, y, width: moduleWidth, height: getNodeSize(node) * usableHeight };
            break;
          case Depth.BRANCH:
            if (!getNodeSize) {
              console.error("getNodeSize was not set!");
              return;
            }
            let branchHeight = getNodeSize(node) * usableHeight;
            node.layout = { x, y, width: moduleWidth, height: branchHeight };
            if (node.isLeft) {
              y += branchHeight;
            }
            break;
          case Depth.STREAMLINE_NODE:
            const network = node.getAncestor(NETWORK_ROOT);
            if (!network) {
              console.error("Streamline node has no NetworkRoot parent");
              return;
            }
            getNodeSize = getNodeSizeForNetwork(network);
            const nodeHeight = getNodeSize(node) * usableHeight;
            y -= nodeHeight;
            node.layout = { x, y, width: moduleWidth, height: nodeHeight };
            break;
          default:
            break;
        }
      }
    );
  }
}
