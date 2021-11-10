import Root from "./Root";
import Depth from "./Depth";
import { NOT_HIGHLIGHTED } from "./HighlightGroup";

export default class Diagram {
  alluvialRoot = new Root();

  constructor(networks) {
    networks?.forEach((network) => this.alluvialRoot.addNetwork(network));
  }

  addNetwork(network) {
    this.alluvialRoot.addNetwork(network);
  }

  doubleClick(alluvialObject, event) {
    const noKeyModifiers = {
      shiftKey: false,
    };

    const { shiftKey } = event || noKeyModifiers;
    const action = shiftKey
      ? this.alluvialRoot.regroupModule
      : this.alluvialRoot.expandModule;

    const { depth } = alluvialObject;

    if (depth === Depth.MODULE) {
      const { moduleId, networkId } = alluvialObject;
      return action.call(this.alluvialRoot, moduleId, networkId);
    }

    if (depth === Depth.STREAMLINE_NODE) {
      const { rightNetworkId, leftNetworkId, rightModuleId, leftModuleId } =
        alluvialObject;
      const leftSuccess = action.call(
        this.alluvialRoot,
        leftModuleId,
        leftNetworkId
      );
      const rightSuccess = action.call(
        this.alluvialRoot,
        rightModuleId,
        rightNetworkId
      );
      return leftSuccess || rightSuccess;
    }

    return false;
  }

  setModuleName({ networkId, moduleId }, name) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    const module = networkRoot.getModule(moduleId);
    if (!module) return;
    module.name = name;
  }

  setNetworkName({ networkId }, networkName) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    networkRoot.name = networkName;
  }

  setModuleColor(
    { highlightIndex, networkId, moduleId },
    paintNodesInAllNetworks = false,
    paintModuleIdsInAllNetworks = false
  ) {
    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);
    if (!networkRoot) return;
    const module = networkRoot.getModule(moduleId);
    if (!module) return;
    const leafNodes = Array.from(module.leafNodes());

    leafNodes.forEach((node) => {
      node.highlightIndex = highlightIndex;
      node.update();
    });

    if (paintNodesInAllNetworks) {
      this.alluvialRoot.children
        .filter((root) => root.networkId !== networkId)
        .forEach((networkRoot) =>
          leafNodes
            .reduce((nodes, node) => {
              const oppositeNode = networkRoot.getLeafNode(node.identifier);
              if (oppositeNode) {
                oppositeNode.highlightIndex = highlightIndex;
                nodes.push(oppositeNode);
              }
              return nodes;
            }, [])
            .forEach((node) => node.update())
        );
    } else if (paintModuleIdsInAllNetworks) {
      this.alluvialRoot.children
        .filter((root) => root.networkId !== networkId)
        .forEach((networkRoot) => {
          const oppositeModule = networkRoot.getModule(moduleId);
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
      alluvialObject?.networkId ?? this.alluvialRoot.children[0].networkId;

    if (!networkId) {
      console.warn("Tried to auto paint but could not find a network id!");
      return;
    }

    const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);

    if (!networkRoot) {
      console.warn(`No network root found with id ${networkId}`);
      return;
    }

    if (highlightIndices.length === 0) {
      console.warn("Zero length array of highlight indices");
      return;
    }

    if (paintNodesInAllNetworks) {
      networkRoot.children
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

      this.alluvialRoot.children.forEach((network) => {
        network.children.forEach((module) => {
          moduleIds.add(module.moduleId);
        });
      });

      const moduleHighlightindexMap = {};

      const differenceIndex = (array1, array2) => {
        const minLength = Math.min(array1.length, array2.length);
        for (let i = 0; i < minLength; i++) {
          if (array1[i] !== array2[i]) return i;
        }
        return 0;
      };

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

      this.alluvialRoot.children.forEach((network) => {
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
    for (let networkRoot of this.alluvialRoot) {
      const modules = [];
      for (let module of networkRoot) {
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

      for (let networkRoot of this.alluvialRoot) {
        for (let id of file.content) {
          const leafNode = networkRoot.getLeafNode(id);

          if (leafNode && !nodes.has(leafNode)) {
            leafNode.highlightIndex = file.highlightIndex;
            leafNode.update();
            nodes.add(leafNode);
          }
        }
      }
    }
  }

  getVisibleModules() {
    const networkRoots = this.alluvialRoot.children;

    const visibleModules = {};

    networkRoots.forEach(
      ({ networkId, children }) =>
        (visibleModules[networkId] = children.map((module) => module.moduleId))
    );

    return visibleModules;
  }

  clearFilters() {
    this.alluvialRoot.children.forEach((networkRoot) =>
      networkRoot.clearFilter()
    );
  }

  setVisibleModules(visibleModules) {
    for (let [networkId, moduleIds] of Object.entries(visibleModules)) {
      const networkRoot = this.alluvialRoot.getNetworkRoot(networkId);

      if (!networkRoot) {
        console.warn(`Invalid network id ${networkId}`);
        return;
      }

      networkRoot.setVisibleModules(moduleIds);
    }
  }

  updateLayout() {
    this.alluvialRoot.calcFlow();
    this.alluvialRoot.updateLayout(...arguments);
  }
}
