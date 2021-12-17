import differenceIndex from "../utils/difference-index";
import { NOT_HIGHLIGHTED } from "./HighlightGroup";
import Root from "./Root";

export default class Diagram {
  root = new Root();

  constructor(networks) {
    networks?.forEach((network) => this.addNetwork(network));
  }

  addNetwork(network) {
    this.root.addNetwork(network);
  }

  setModuleColor(
    { highlightIndex, networkId, moduleId },
    paintNodesInAllNetworks = false,
    paintModuleIdsInAllNetworks = false
  ) {
    const network = this.root.getNetwork(networkId);
    if (!network) return;
    const module = network.getModule(moduleId);
    if (!module) return;
    const leafNodes = Array.from(module.leafNodes());

    leafNodes.forEach((node) => {
      node.highlightIndex = highlightIndex;
      node.update();
    });

    if (paintNodesInAllNetworks) {
      this.root.children
        .filter((network) => network.networkId !== networkId)
        .forEach((network) =>
          leafNodes
            .reduce((nodes, node) => {
              const oppositeNode = network.getLeafNode(node.identifier);
              if (oppositeNode) {
                oppositeNode.highlightIndex = highlightIndex;
                nodes.push(oppositeNode);
              }
              return nodes;
            }, [])
            .forEach((node) => node.update())
        );
    } else if (paintModuleIdsInAllNetworks) {
      this.root.children
        .filter((network) => network.networkId !== networkId)
        .forEach((network) => {
          const oppositeModule = network.getModule(moduleId);
          if (oppositeModule) {
            this.setModuleColor({
              ...oppositeModule,
              highlightIndex,
            });
          }
        });
    }
  }

  autoPaint(
    alluvialObject = null,
    highlightColors,
    paintNodesInAllNetworks = true,
    paintModuleIdsInAllNetworks = false
  ) {
    const highlightIndices = Array.from(highlightColors.keys());

    if (paintNodesInAllNetworks && paintModuleIdsInAllNetworks) {
      console.warn(
        "Cannot use paintNodesInAllNetworks and paintModuleIdsInAllNetworks together"
      );
      return;
    }

    this.removeColors();

    const networkId =
      alluvialObject?.networkId ?? this.root.children[0].networkId;

    if (!networkId) {
      console.warn("Tried to auto paint but could not find a network id!");
      return;
    }

    const network = this.root.getNetwork(networkId);

    if (!network) {
      console.warn(`No network root found with id ${networkId}`);
      return;
    }

    if (highlightIndices.length === 0) {
      console.warn("Zero length array of highlight indices");
      return;
    }

    if (paintNodesInAllNetworks) {
      network.children
        .filter((module) => module.flow > 0)
        .forEach((module, i) =>
          this.setModuleColor(
            {
              ...module,
              highlightIndex: highlightIndices[i % highlightIndices.length],
            },
            true,
            false
          )
        );
    } else if (paintModuleIdsInAllNetworks) {
      const moduleIds = new Set();

      this.root.children.forEach((network) => {
        network.children.forEach((module) => {
          moduleIds.add(module.moduleId);
        });
      });

      const moduleHighlightindexMap = {};

      Array.from(moduleIds)
        .sort((a, b) => {
          if (a === b) return 0;

          let aPath = a.split(":");
          let bPath = b.split(":");

          if (aPath.length === bPath.length) {
            const i = differenceIndex(aPath, bPath);

            return +aPath[i] < +bPath[i] ? -1 : 1;
          }

          // different lengths
          return aPath.length < bPath.length ? -1 : 1;
        })
        .forEach((moduleId, i) => {
          moduleHighlightindexMap[moduleId] =
            highlightIndices[i % highlightIndices.length];
        });

      this.root.children.forEach((network) => {
        network.children
          .filter((module) => module.flow > 0)
          .forEach((module) =>
            this.setModuleColor(
              {
                ...module,
                highlightIndex: moduleHighlightindexMap[module.moduleId],
              },
              false,
              false
            )
          );
      });
    }
  }

  removeColors() {
    for (let network of this.root) {
      const modules = [];
      for (let module of network) {
        for (let highlightGroup of module) {
          if (highlightGroup.isHighlighted) {
            modules.push(module);
            break;
          }
        }
      }
      modules.forEach((module) =>
        this.setModuleColor({
          ...module,
          highlightIndex: NOT_HIGHLIGHTED,
        })
      );
    }
  }

  setNodesColors(highlightedNodes) {
    for (let file of highlightedNodes) {
      const nodes = new Set();

      for (let network of this.root) {
        for (let id of file.content) {
          const leafNode = network.getLeafNode(id);

          if (leafNode && !nodes.has(leafNode)) {
            leafNode.highlightIndex = file.highlightIndex;
            leafNode.update();
            nodes.add(leafNode);
          }
        }
      }
    }
  }

  updateLayout() {
    this.root.calcFlow();
    this.root.updateLayout(...arguments);
  }
}
