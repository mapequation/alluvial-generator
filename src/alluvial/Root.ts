import Tree from "../utils/Tree";
import AlluvialNodeBase from "./AlluvialNode";
import Branch from "./Branch";
import Depth, { NETWORK, ROOT } from "./Depth";
import HighlightGroup from "./HighlightGroup";
import Module from "./Module";
import Network from "./Network";
import StreamlineNode from "./StreamlineNode";

export type VerticalAlign = "bottom" | "justify" | "top";

export type ModuleSize = "flow" | "nodes";

const differenceIndex = (array1: number[], array2: number[]) => {
  const minLength = Math.min(array1.length, array2.length);
  for (let i = 0; i < minLength; i++) {
    if (array1[i] !== array2[i]) return i;
  }
  return 0;
};

type GetNodeSize = (node: { flow: number; numLeafNodes: number }) => number;

const getNodeSizeByPropForNetwork =
  ({ numLeafNodes }: Network, maxFlow: number) =>
  (property: string): GetNodeSize => {
    if (property === "flow") {
      return (node: any) => node.flow / maxFlow;
    } else if (property === "nodes") {
      return (node: any) => node.numLeafNodes / numLeafNodes;
    }
    return () => 0;
  };

/*
                       Root
+--------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                          |
|                     Network                                                                                              |
| +-------------------------------------------------+                                                                      |
| |                                                 |                                                                      |
| |                   Module                        |                                                                      |
| | +---------------------------------------------+ |                                                                      |
| | |                                             | |                                                                      |
| | |              HighlightGroup                 | |                                                                      |
| | | +-----------------------------------------+ | |                                                                      |
| | | |                                         | | |                                                                      |
| | | |    Branch (LEFT)       Branch (RIGHT)   | | |                                                                      |
| | | | +-----------------+ +-----------------+ | | |                                                                      |
| | | | |                 | |                 | | | |                                                                      |
| | | | | StreamlineNode  | | StreamlineNode  | | | |                                                                      |
| | | | | +-------------+ | | +-------------+ | | | |                                                                      |
| | | | | |             | | | |             | | | | |                                       StreamlineNode                 |
| | | | | |             | | | |             | | | | |                          +------------+-------------+                |
| | | | | |             | | | |             | | | | |                       +--+            |             |                |
| | | | | |             | | | +-------------+ | | | |                   +---+               |             |                |
| | | | | |             | | |                 | | | |              +----+                   |             |                |
| | | | | |             | | | StreamlineNode  | | | |          +---+                        |             |                |
| | | | | |             | | | +-------------+-----------------+                             |             |                |
| | | | | |             | | | |             |                                               |             |                |
| | | | | |             | | | |             |                  StreamlineLink               |             |                |
| | | | | |             | | | |             |                                               |             |                |
| | | | | |             | | | |             |                                               |             |                |
| | | | | |             | | | |             |  Source (LEFT)                 Target (RIGHT) |             |                |
| | | | | |             | | | |             |                                               |   LeafNode  |                |
| | | | | |             | | | |             |                                               | +-------------------------+  |
| | | | | |             | | | |             |                                               | |                         |  |
| | | | | |             | | | |             |                                               | |                         |  |
| | | | | |             | | | |             |                                               | +-------------------------+  |
| | | | | |             | | | |             |                                               |             |                |
| | | | | |   LeafNode  | | | |             |                                +--------------+-------------+                |
| | | | | | +-----------------------------+ |                           +----+                                             |
| | | | | | |                             | |                      +----+                                                  |
| | | | | | |                             | |                   +--+                                                       |
| | | | | | +-----------------------------+ |               +---+                                                          |
| | | | | |             | | | |             |           +--+                                                               |
| | | | | +-------------+ | | +-------------+----------+                                                                   |
| | | | |                 | |                 | | | |                                                                      |
| | | | +-----------------+ +-----------------+ | | |                                                                      |
| | | |                                         | | |                                                                      |
| | | +-----------------------------------------+ | |                                                                      |
| | |                                             | |                                                                      |
| | +---------------------------------------------+ |                                                                      |
| |                                                 |                                                                      |
| +-------------------------------------------------+                                                                      |
|                                                                                                                          |
+--------------------------------------------------------------------------------------------------------------------------+
 */
export default class Root extends AlluvialNodeBase<Network> {
  depth = ROOT;

  constructor() {
    super(null, "", "root");
  }

  getNetworkRoot(networkId: string): Network | null {
    return this.children.find((root) => root.networkId === networkId) ?? null;
  }

  addNetwork(network: any) {
    // FIXME
    const { nodes, id, codelength, name, moduleNames } = network;

    if (this.children.some((network) => network.networkId === id)) {
      throw new Error(`Network with id ${id} already exists`);
    }

    if (moduleNames) {
      Module.customNames = new Map([...Module.customNames, ...moduleNames]);
    }

    new Network(this, id, name, codelength).addNodes(nodes);
  }

  calcFlow() {
    console.time("Root.calcFlow");
    this.forEachDepthFirstPostOrder((node) => {
      if (node instanceof HighlightGroup) {
        node.flow = node.left.flow;
      } else if (node.depth < Depth.LEAF_NODE) {
        node.flow = node.children.reduce(
          (total, child) => total + child.flow,
          0
        );
      }
    });
    console.timeEnd("Root.calcFlow");
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
    console.time("Root.updateLayout");
    const numNetworks = this.children.length;

    if (!numNetworks) return;

    const streamlineWidth = streamlineFraction * moduleWidth;
    const networkWidth = moduleWidth + streamlineWidth;
    const totalWidth = networkWidth * numNetworks - streamlineWidth;

    let x = 0;
    let y = height;

    const maxNetworkFlow = Math.max(
      ...this.children.map((network) => network.flow)
    );

    const totalMargins = new Array(numNetworks).fill(0);
    const visibleFlows = new Array(numNetworks).fill(0);
    const visibleModules = new Array(numNetworks).fill(0);
    let networkIndex = 0;

    let getNodeSize: GetNodeSize | null = null;
    let moduleHeight = 0;
    let moduleMargin = 0;

    const moduleIsVisible = (module: Module) =>
      module.flow >= flowThreshold && module.isVisible;

    // Use first pass to get order of modules to sort streamlines in second pass
    // Y position of modules will be tuned in second pass depending on max margins
    this.forEachDepthFirstPreOrderWhile(
      (node: any) =>
        node.depth < Depth.MODULE ||
        (node instanceof Module && moduleIsVisible(node)) ||
        node instanceof HighlightGroup,
      (node: any, i: number, nodes: any[]) => {
        if (node instanceof Network) {
          const getNodeSizeByProp = getNodeSizeByPropForNetwork(
            node,
            maxNetworkFlow
          );
          getNodeSize = getNodeSizeByProp(moduleSize);
          node.flowThreshold = flowThreshold;
          networkIndex = i;
          new Tree(node.children, getNodeSizeByProp(sortModulesBy))
            .sort()
            .flatten()
            .forEach((child: Module, index: number) => (child.index = index));
          node.children.sort((a, b) => a.index - b.index);
          if (i > 0) x += networkWidth;
          y = height;
        } else if (node instanceof Module && getNodeSize) {
          node.children.sort((a: HighlightGroup, b: HighlightGroup) => {
            const byHighlightIndex = a.highlightIndex - b.highlightIndex;
            if (byHighlightIndex !== 0) return byHighlightIndex;
            return a.insignificant ? 1 : -1;
          });
          const margin =
            i + 1 < nodes.length
              ? 2 **
                (marginExponent -
                  2 * differenceIndex(node.path, nodes[i + 1].path))
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
        } else if (node instanceof HighlightGroup && getNodeSize) {
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
      const moduleMarginScale =
        (maxMarginFractionOfHeight * height) / maxTotalMargin;

      this.forEachDepthFirstWhile(
        (node: any) => node.depth <= Depth.MODULE,
        (node: any) => {
          if (node instanceof Module) {
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
        (node: any) =>
          node.depth < Depth.MODULE ||
          (node instanceof Module && moduleIsVisible(node)),
        (node: any, i: number) => {
          if (node instanceof Network) {
            totalMargin = totalMargins[i];
            numMargins = visibleModules[i] - 1;
            visibleFlow = visibleFlows[i];
            missingFlow = 1 - visibleFlow;
            missingMargin = missingFlow * usableHeight;
          } else if (node instanceof Module && node.margin > 0) {
            node.margin *= maxTotalMargin / totalMargin;
            if (numMargins > 0) {
              node.margin += missingMargin / numMargins;
            }
          }
        }
      );
    }

    this.forEachDepthFirstWhile(
      (node: any) => node.depth <= Depth.BRANCH,
      (node: any) => {
        if (node instanceof Branch) {
          node.children.sort(
            (a, b) =>
              a.oppositeStreamlinePosition(flowThreshold) -
              b.oppositeStreamlinePosition(flowThreshold)
          );
        }
      }
    );

    x = 0;
    y = height;

    getNodeSize = null;

    this.forEachDepthFirstPostOrderWhile(
      (node: any) =>
        node.depth !== Depth.MODULE ||
        (node instanceof Module && moduleIsVisible(node)),
      (node: any) => {
        if (node instanceof StreamlineNode) {
          if (!getNodeSize) {
            const network = node.getAncestor(NETWORK) as Network | null;
            if (!network) {
              console.error("Streamline node has no NetworkRoot parent");
              return;
            }
            getNodeSize = getNodeSizeByPropForNetwork(
              network,
              maxNetworkFlow
            )(moduleSize);
          }
          const nodeHeight = getNodeSize(node) * usableHeight;
          y -= nodeHeight;
          node.layout = { x, y, width: moduleWidth, height: nodeHeight };
        } else if (node instanceof Branch && getNodeSize) {
          let branchHeight = getNodeSize(node) * usableHeight;
          node.layout = { x, y, width: moduleWidth, height: branchHeight };
          if (node.isLeft) {
            y += branchHeight;
          }
        } else if (node instanceof HighlightGroup && getNodeSize) {
          node.layout = {
            x,
            y,
            width: moduleWidth,
            height: getNodeSize(node) * usableHeight,
          };
        } else if (node instanceof Module && getNodeSize) {
          node.layout = {
            x,
            y,
            width: moduleWidth,
            height: getNodeSize(node) * usableHeight,
          };
          y -= node.margin;
        } else if (node instanceof Network) {
          node.layout = { x, y: 0, width: moduleWidth, height };
          x += networkWidth;
          y = height;
          getNodeSize = null;
        } else if (node instanceof Root) {
          node.layout = { x: 0, y: 0, width: totalWidth, height };
        }
      }
    );

    console.timeEnd("Root.updateLayout");
  }
}
