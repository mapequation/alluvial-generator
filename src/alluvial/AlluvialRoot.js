// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Side";
import Depth, { ALLUVIAL_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";


export type VerticalAlign = "bottom" | "justify" | "top";


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

    return networkRoot.getLeafNodeByName(node.name);
  }

  getModuleById(id: string): ?Module {
    const [networkId, moduleId] = Module.splitId(id);
    const networkRoot = this.getNetworkRoot(networkId);
    if (!networkRoot) return;
    return networkRoot.getModule(moduleId);
  }

  updateLayout(
    totalWidth: number,
    height: number,
    streamlineFraction: number,
    maxModuleWidth: number,
    flowThreshold: number,
    verticalAlign: VerticalAlign = "bottom",
  ) {
    const numNetworks = this.numChildren;

    if (!numNetworks) return;

    const width = Math.min(
      totalWidth / (numNetworks + (numNetworks - 1) * streamlineFraction),
      maxModuleWidth,
    );
    const streamlineWidth = streamlineFraction * width;
    const networkWidth = width + streamlineWidth;

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

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.forEachDepthFirstPreOrderWhile(
      node =>
        node.depth < Depth.MODULE ||
        (node.depth === Depth.MODULE && node.flow >= flowThreshold),
      (node, i, nodes) => {
        switch (node.depth) {
          case Depth.NETWORK_ROOT:
            node.flowThreshold = flowThreshold;
            networkIndex = i;
            node.sortChildren();
            if (i > 0) x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            node.sortChildren();
            const margin =
              i + 1 < nodes.length
                ? 2 ** (5 - differenceIndex(node.path, nodes[i + 1].path))
                : 0;
            y -= node.flow * height;
            node.margin = margin;
            node.layout = { x, y, width, height: node.flow * height };
            y -= margin;
            totalMargins[networkIndex] += margin;
            visibleFlows[networkIndex] += node.flow;
            visibleModules[networkIndex]++;
            break;
          default:
            break;
        }
      },
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
        },
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
        },
      );
    }

    this.forEachDepthFirstWhile(
      node => node.depth <= Depth.BRANCH,
      node => {
        if (node.depth === Depth.BRANCH) {
          node.sortChildren(flowThreshold);
        }
      },
    );

    x = 0;
    y = height;

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
            node.layout = { x, y: 0, width, height };
            x += networkWidth;
            y = height;
            break;
          case Depth.MODULE:
            node.layout = { x, y, width, height: node.flow * usableHeight };
            y -= node.margin;
            break;
          case Depth.HIGHLIGHT_GROUP:
            node.layout = { x, y, width, height: node.flow * usableHeight };
            break;
          case Depth.BRANCH:
            node.layout = { x, y, width, height: node.flow * usableHeight };
            if (node.isLeft) {
              y += node.flow * usableHeight;
            }
            break;
          case Depth.STREAMLINE_NODE:
            y -= node.flow * usableHeight;
            node.layout = { x, y, width, height: node.flow * usableHeight };
            break;
          default:
            break;
        }
      },
    );
  }
}
