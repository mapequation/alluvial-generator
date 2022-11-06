import { action, makeObservable, observable } from "mobx";
import { createContext } from "react";
import {
  Diagram,
  Identifier,
  LeafNode,
  LEFT,
  Module,
  NOT_HIGHLIGHTED,
  RIGHT,
  Side,
} from "../alluvial";
import type {
  ModuleOrder,
  ModuleSize,
  VerticalAlign,
} from "../alluvial/Diagram";
import type { Real } from "../alluvial/Network";
import type { NetworkFile } from "../components/LoadNetworks";
import type { Histogram } from "../components/Sidebar/Metadata/Real";
import TreePath from "../utils/TreePath";
import BipartiteGraph from "./BipartiteGraph";
import { COLOR_SCHEMES, ColorScheme, SchemeName } from "./schemes";

export class Store {
  diagram = new Diagram();

  files: NetworkFile[] = [];
  identifier: Identifier = "id";

  // hack to force updates when we call updateLayout
  updateFlag = true;

  numNetworks = 0;

  height: number = 600;
  duration: number = 0.2;
  marginExponent: number = 4;
  moduleWidth: number = 80;
  streamlineFraction: number = 2;
  streamlineThreshold: number = 1;
  streamlineOpacity: number = 0.8;
  flowThreshold: number = 5e-3;

  selectedScheme: ColorScheme = COLOR_SCHEMES["C3 Sinebow"];
  selectedSchemeName: SchemeName = "C3 Sinebow";

  defaultHighlightColor: string = "#b6b69f";
  highlightColors: string[] = [...this.selectedScheme];

  verticalAlign: VerticalAlign = "bottom";
  moduleSize: ModuleSize = "flow";
  sortModulesBy: ModuleOrder = "flow";

  showModuleId: boolean = false;
  showModuleNames: boolean = true;
  multilineModuleNames: boolean = true;
  showNetworkNames: boolean = true;
  aggregateStateNames: boolean = true;
  titleCaseModuleNames: boolean = false;

  hierarchicalModules: "none" | "outline" | "shadow" = "shadow";
  hierarchicalModuleOffset: number = 5;
  hierarchicalModuleOpacity: number = 0.5;

  dropShadow: boolean = false;
  fontSize: number = 8;
  networkFontSize: number = 10;
  adaptiveFontSize: boolean = false;

  selectedModule: Module | null = null;

  editMode: boolean = false;

  constructor() {
    makeObservable(this, {
      diagram: observable.ref,
      files: observable.ref,
      identifier: observable,
      updateFlag: observable,
      numNetworks: observable,
      height: observable,
      duration: observable,
      marginExponent: observable,
      moduleWidth: observable,
      streamlineFraction: observable,
      streamlineThreshold: observable,
      streamlineOpacity: observable,
      flowThreshold: observable,
      selectedScheme: observable.ref,
      selectedSchemeName: observable,
      defaultHighlightColor: observable,
      highlightColors: observable,
      verticalAlign: observable,
      moduleSize: observable,
      sortModulesBy: observable,
      showModuleId: observable,
      showModuleNames: observable,
      multilineModuleNames: observable,
      showNetworkNames: observable,
      aggregateStateNames: observable,
      titleCaseModuleNames: observable,
      hierarchicalModules: observable,
      hierarchicalModuleOffset: observable,
      hierarchicalModuleOpacity: observable,
      dropShadow: observable,
      fontSize: observable,
      networkFontSize: observable,
      adaptiveFontSize: observable,
      selectedModule: observable,
      editMode: observable,
    });
  }

  setNetworks = action((networks: any[], selectLargest = true) => {
    console.time("Store.setNetworks");
    this.setSelectedModule(null);
    this.diagram = new Diagram(networks);
    this.numNetworks = networks.length;
    this.updateLayout();

    // Select the largest module in the leftmost network.
    if (selectLargest) {
      this.setSelectedModule(this.diagram.children[0]?.children[0]);
    }

    console.timeEnd("Store.setNetworks");
  });

  setFiles = action((files: NetworkFile[], selectLargest = true) => {
    this.files = files;
    this.setNetworks(files, selectLargest);
  });

  setIdentifier = action((identifier: "id" | "name") => {
    this.identifier = identifier;
  });

  setHeight = action((height: number) => {
    this.height = height;
    this.updateLayout();
  });

  setDuration = action((duration: number) => {
    this.duration = duration;
  });

  setMarginExponent = action((marginExponent: number) => {
    this.marginExponent = marginExponent;
    this.updateLayout();
  });

  setModuleWidth = action((moduleWidth: number) => {
    this.moduleWidth = moduleWidth;
    this.updateLayout();
  });

  setStreamlineFraction = action((streamlineFraction: number) => {
    this.streamlineFraction = streamlineFraction;
    this.updateLayout();
  });

  setStreamlineThreshold = action((streamlineThreshold: number) => {
    this.streamlineThreshold = streamlineThreshold;
    this.updateLayout();
  });

  setStreamlineOpacity = action((streamlineOpacity: number) => {
    this.streamlineOpacity = streamlineOpacity;
  });

  setFlowThreshold = action((flowThreshold: number) => {
    this.flowThreshold = flowThreshold;
    this.updateLayout();
  });

  setSelectedScheme = action((scheme: SchemeName) => {
    this.selectedSchemeName = scheme;
    this.selectedScheme = COLOR_SCHEMES[scheme];
  });

  setDefaultHighlightColor = action((defaultHighlightColor: string) => {
    this.defaultHighlightColor = defaultHighlightColor;
  });

  setHighlightColors = action((highlightColors: string[]) => {
    this.highlightColors = highlightColors;
  });

  getHighlightIndex = action((highlightColor: string) => {
    if (highlightColor === this.defaultHighlightColor) {
      return -1;
    }

    const colors = this.highlightColors;

    if (colors.includes(highlightColor)) {
      return colors.indexOf(highlightColor);
    }

    const index = colors.push(highlightColor) - 1;

    this.highlightColors = [...colors];

    return index;
  });

  getHighlightColor(highlightIndex?: number, defaultHighlightColor?: string) {
    if (
      highlightIndex == null ||
      highlightIndex > this.highlightColors.length - 1
    )
      return undefined;
    if (highlightIndex === NOT_HIGHLIGHTED)
      return defaultHighlightColor ?? this.defaultHighlightColor;
    return this.highlightColors[highlightIndex];
  }

  setVerticalAlign = action((verticalAlign: VerticalAlign) => {
    this.verticalAlign = verticalAlign;
    this.updateLayout();
  });

  setModuleSize = action((moduleSize: ModuleSize) => {
    this.moduleSize = moduleSize;
    this.updateLayout();
  });

  setSortModulesBy = action((sortModulesBy: ModuleOrder) => {
    this.sortModulesBy = sortModulesBy;
    this.updateLayout();
  });

  setShowModuleId = action((showModuleId: boolean) => {
    this.showModuleId = showModuleId;
  });

  setShowModuleNames = action((showModuleNames: boolean) => {
    this.showModuleNames = showModuleNames;
  });

  setMultilineModuleNames = action((multilineModuleNames: boolean) => {
    this.multilineModuleNames = multilineModuleNames;
  });

  setShowNetworkNames = action((showNetworkNames: boolean) => {
    this.showNetworkNames = showNetworkNames;
  });

  setAggregateStateNames = action((aggregateStateNames: boolean) => {
    this.aggregateStateNames = aggregateStateNames;
  });

  setTitleCaseModuleNames = action((titleCaseModuleNames: boolean) => {
    this.titleCaseModuleNames = titleCaseModuleNames;
  });

  setHierarchicalModules = action(
    (hierarchicalModules: "none" | "outline" | "shadow") => {
      this.hierarchicalModules = hierarchicalModules;
    }
  );

  setHierarchicalModuleOffset = action((hierarchicalModuleOffset: number) => {
    this.hierarchicalModuleOffset = hierarchicalModuleOffset;
  });

  setHierarchicalModuleOpacity = action((hierarchicalModuleOpacity: number) => {
    this.hierarchicalModuleOpacity = hierarchicalModuleOpacity;
  });

  setDropShadow = action((dropShadow: boolean) => {
    this.dropShadow = dropShadow;
  });

  setFontSize = action((fontSize: number) => {
    this.fontSize = fontSize;
  });

  setNetworkFontSize = action((fontSize: number) => {
    this.networkFontSize = fontSize;
  });

  setAdaptiveFontSize = action((value: boolean) => {
    this.adaptiveFontSize = value;
  });

  setSelectedModule = action((selectedModule: Module | null) => {
    this.selectedModule = selectedModule;
  });

  setEditMode = action((editMode: boolean) => {
    this.editMode = editMode;
  });

  setModuleName = action((module: Module, name: string) => {
    module.name = name;
    this.toggleUpdate();
  });

  setNetworkName = action((networkId: string, name: string) => {
    const network = this.diagram.getNetwork(networkId);
    if (network) {
      network.name = name;
      this.toggleUpdate();
    }
  });

  toggleUpdate = action(() => {
    this.updateFlag = !this.updateFlag;
  });

  selectModule(direction: "up" | "down" | "left" | "right") {
    if (!this.selectedModule) return;

    if (direction === "up" || direction === "down") {
      const modules = this.selectedModule.parent?.visibleChildren ?? [];
      const index = this.selectedModule.parentIndex;
      if (direction === "up" && index < modules.length - 1) {
        this.setSelectedModule(modules[index + 1]);
      } else if (direction === "down" && index > 0) {
        this.setSelectedModule(modules[index - 1]);
      }
    } else if (direction === "left" || direction === "right") {
      const side = direction === "left" ? LEFT : RIGHT;
      const modules = this.selectedModule.getSimilarModules(side, 1);
      if (modules.length) {
        this.setSelectedModule(modules[0].module);
      }
    }
  }

  expand(module: Module) {
    const { parent, moduleId } = module;
    const success = module.expand();
    if (!success) return false;
    this.updateLayout();

    const visibleSubModules = parent.children.filter(
      (module) => module.isVisible && module.moduleId.startsWith(moduleId)
    );

    if (visibleSubModules.length > 0) {
      const largestSubModule = visibleSubModules.reduce((max, module) =>
        module.flow > max.flow ? module : max
      );
      this.setSelectedModule(largestSubModule);
    }
    return success;
  }

  regroup(module: Module) {
    const { parent, moduleId } = module;
    const success = module.regroup();
    if (!success) return false;
    this.updateLayout();

    const parentModuleId = TreePath.parentPath(moduleId)?.toString() ?? null;
    if (parentModuleId) {
      const superModule = parent.getModule(parentModuleId) ?? null;
      if (superModule != null) {
        this.setSelectedModule(superModule);
      }
    }
    return success;
  }

  colorModule(module: Module, color: string, updateLayout = true) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    if (updateLayout) {
      this.updateLayout();
    }
  }

  colorMatchingModules(module: Module, color: string, side?: Side) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    if (!side || side === LEFT) {
      const left = module.getSimilarModules(LEFT);
      if (left.length) {
        this.colorMatchingModules(left[0].module, color, LEFT);
      }
    }

    if (!side || side === RIGHT) {
      const right = module.getSimilarModules(RIGHT);
      if (right.length) {
        this.colorMatchingModules(right[0].module, color, RIGHT);
      }
    }

    if (!side) this.updateLayout();
  }

  colorMatchingModulesInAllNetworks() {
    this.clearColors(false);

    const networks = this.diagram.children;

    if (networks.length < 2) {
      networks[0].children.forEach((module, i) => {
        const color = this.selectedScheme[i % this.selectedScheme.length];
        this.colorModule(module, color, false);
      });
      this.updateLayout();
      return;
    }

    console.time("Store.colorMatchingModulesInAllNetworks");

    const bipartiteGraphs = [];

    for (let i = 0; i < networks.length - 1; ++i) {
      const leftNetwork = networks[i];
      const B = (bipartiteGraphs[i] = new BipartiteGraph<Module>());

      for (const module of leftNetwork) {
        module
          .getSimilarModules(RIGHT, 1)
          .forEach((match) =>
            B.addLink(module, match.module, match.similarity)
          );
      }

      let highlightIndex = 0;
      for (const left of B.left) {
        let color: string;

        if (left.isHighlighted) {
          color = this.highlightColors[left.highlightIndex];
        } else {
          const largestLink = Array.from(B.links.get(left)!.keys()).reduce(
            (max, module) =>
              module.isHighlighted && max.flow < module.flow ? module : max,
            {
              flow: -Infinity,
              isHighlighted: false,
              highlightIndex: NOT_HIGHLIGHTED,
            } as Module
          );

          if (largestLink.isHighlighted) {
            color = this.highlightColors[largestLink.highlightIndex];
          } else {
            color =
              this.selectedScheme[highlightIndex % this.selectedScheme.length];
          }

          this.colorModule(left, color, false);
          highlightIndex++;
        }

        for (const right of B.links.get(left)!.keys()) {
          if (!right.isHighlighted) this.colorModule(right, color, false);
        }
      }
    }

    console.timeEnd("Store.colorMatchingModulesInAllNetworks");
    this.updateLayout();
  }

  colorNodesInModule(module: Module, color: string, updateLayout = true) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);

    this.diagram.children
      .filter((network) => network.networkId !== module.networkId)
      .forEach((network) =>
        module
          .getLeafNodes()
          .reduce((nodes, node) => {
            const oppositeNode = network.getLeafNode(node.identifier);
            if (oppositeNode) {
              oppositeNode.highlightIndex = highlightIndex;
              nodes.push(oppositeNode);
            }
            return nodes;
          }, [] as LeafNode[])
          .forEach((node) => node.update())
      );

    if (updateLayout) this.updateLayout();
  }

  colorNodesInModulesInAllNetworks(networkId: string | undefined) {
    this.clearColors(false);

    const network = this.diagram.getNetwork(
      networkId ?? this.diagram.children[0].networkId
    );

    network?.children
      .filter((module) => module.isVisible)
      .forEach((module, i) => {
        const color = this.selectedScheme[i % this.selectedScheme.length];
        this.colorNodesInModule(module, color, false);
      });

    this.updateLayout();
  }

  colorSelectedNodes(nodes: LeafNode[], color: string) {
    const highlightIndex = this.getHighlightIndex(color);
    nodes.forEach((node) => {
      node.highlightIndex = highlightIndex;
      node.update();
      this.diagram.children.forEach((network) => {
        if (network.networkId === node.networkId) return;
        const other = network.getLeafNode(node.identifier);
        if (!other) return;
        other.highlightIndex = highlightIndex;
        other.update();
      });
    });
    this.updateLayout();
  }

  colorModuleIds(module: Module, color: string) {
    const highlightIndex = this.getHighlightIndex(color);
    module.setColor(highlightIndex);
    const { moduleId } = module;

    this.diagram.children
      .filter((network) => network.networkId !== module.networkId)
      .forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible && module.moduleId === moduleId) {
            module.setColor(highlightIndex);
          }
        })
      );

    this.updateLayout();
  }

  colorModuleIdsInAllNetworks() {
    const moduleIdColorMap = new Map();

    const setModuleColor = (module: Module) => {
      const color = moduleIdColorMap.get(module.moduleId);
      if (color) {
        const highlightIndex = this.getHighlightIndex(color);
        module.setColor(highlightIndex);
      } else {
        const color =
          this.selectedScheme[
            moduleIdColorMap.size % this.selectedScheme.length
          ];
        moduleIdColorMap.set(module.moduleId, color);
        const highlightIndex = this.getHighlightIndex(color);
        module.setColor(highlightIndex);
      }
    };

    // If we only have one expanded multilayer network,
    // sort all modules and assign "higher" colors to the largest modules.
    const multilayerNetworkId = this.diagram.children[0]?.originalId;
    if (
      this.diagram.children.every(
        (network) =>
          network.layerId != null && network.originalId === multilayerNetworkId
      )
    ) {
      const modulesById: {
        [moduleId: string]: { flow: number; modules: Module[] };
      } = {};

      this.diagram.children.forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible) {
            if (!modulesById[module.moduleId]) {
              modulesById[module.moduleId] = { flow: 0, modules: [] };
            }
            modulesById[module.moduleId].flow += module.flow;
            modulesById[module.moduleId].modules.push(module);
          }
        })
      );

      const modules = Array.from(Object.values(modulesById));
      modules.sort((a, b) => b.flow - a.flow);
      modules.forEach(({ modules }) => modules.forEach(setModuleColor));
    } else {
      this.diagram.children.forEach((network) =>
        network.children.forEach((module) => {
          if (module.isVisible) {
            setModuleColor(module);
          }
        })
      );
    }

    this.updateLayout();
  }

  colorByLayer() {
    const layerIdColorMap = new Map();

    this.diagram.children.forEach((network) => {
      network.children.forEach((module) => {
        if (module.isVisible) {
          module.getLeafNodes().forEach((node) => {
            if (node.layerId == null) return;

            if (!layerIdColorMap.has(node.layerId)) {
              let color =
                this.selectedScheme[
                  layerIdColorMap.size % this.selectedScheme.length
                ];
              layerIdColorMap.set(node.layerId, color);
            }

            let color = layerIdColorMap.get(node.layerId);
            node.highlightIndex = this.getHighlightIndex(color);
            node.update();
          });
        }
      });
    });

    this.updateLayout();
  }

  colorByPhysicalId() {
    const physicalIdColorMap = new Map();

    this.diagram.children.forEach((network) => {
      network.children.forEach((module) => {
        if (module.isVisible) {
          module.getLeafNodes().forEach((node) => {
            if (!physicalIdColorMap.has(node.nodeId)) {
              let color =
                this.selectedScheme[
                  physicalIdColorMap.size % this.selectedScheme.length
                ];
              physicalIdColorMap.set(node.nodeId, color);
            }

            let color = physicalIdColorMap.get(node.nodeId);
            node.highlightIndex = this.getHighlightIndex(color);
            node.update();
          });
        }
      });
    });

    this.updateLayout();
  }

  colorCategoricalMetadata(name: string, colors: Map<string, string>) {
    this.clearColors(false);

    for (const color of colors.values()) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(color);
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "string"
          )
            return;

          const meta = node.metadata[name] as string;

          if (colors.has(meta)) {
            node.highlightIndex = this.getHighlightIndex(colors.get(meta)!);
            node.update();
          }
        });
      });
    });

    this.updateLayout();
  }

  colorRealMetadata(name: string, bins: Histogram) {
    this.clearColors(false);

    for (const bin of bins) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(bin.color);
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "number"
          )
            return;

          const meta = node.metadata[name] as number;

          for (const bin of bins) {
            if (meta >= bin.x0 && meta < bin.x1) {
              node.highlightIndex = this.getHighlightIndex(bin.color);
              node.update();
              break;
            }
          }
        });
      });
    });

    this.updateLayout();
  }

  colorRealIntervals(
    name: string,
    data: Real,
    getColor: (meta: number) => string,
    centers: number[]
  ) {
    this.clearColors(false);

    for (const c of centers) {
      // FIXME This is used to get the highlight indices sorted as the color scheme.
      this.getHighlightIndex(getColor(c));
    }

    this.diagram.children.forEach((network) => {
      if (!network.haveMetadata) return;

      network.children.forEach((module) => {
        if (!module.isVisible) return;

        module.getLeafNodes().forEach((node) => {
          if (
            !node.metadata ||
            !(name in node.metadata) ||
            typeof node.metadata[name] !== "number"
          )
            return;

          const meta = node.metadata[name] as number;

          node.highlightIndex = this.getHighlightIndex(getColor(meta));
          node.update();
        });
      });
    });

    this.updateLayout();
  }

  clearColors(updateLayout = true) {
    for (let network of this.diagram) {
      const modules = [];
      for (let module of network) {
        for (let highlightGroup of module) {
          if (highlightGroup.isHighlighted) {
            modules.push(module);
            break;
          }
        }
      }
      modules.forEach((module) => module.removeColors());
    }

    this.setHighlightColors([]);

    if (updateLayout) this.updateLayout();
  }

  updateLayout() {
    this.diagram.calcFlow();
    this.diagram.updateLayout(this);
    this.toggleUpdate();
  }

  resetLayout() {
    this.diagram.children.forEach(
      (network) => (network.isCustomSorted = false)
    );
    this.updateLayout();
  }

  moveSelectedModule(direction: "up" | "down") {
    if (!this.selectedModule) return;

    const didMove = this.selectedModule.move(direction);

    if (didMove) {
      this.diagram.updateLayout(this);
      this.toggleUpdate();
    }

    return didMove;
  }

  moveNetwork(direction: "left" | "right") {
    const selectedModule = this.selectedModule;
    if (!selectedModule) return;

    console.time("Store.moveNetwork");

    const network = this.diagram.getNetwork(selectedModule.networkId)!;
    const index = this.diagram.children.indexOf(network);
    const newIndex = index + (direction === "left" ? LEFT : RIGHT);

    if (newIndex < 0 || newIndex > this.diagram.children.length - 1) {
      console.warn("Cannot move network further");
      return;
    }

    const { files } = this;

    for (const file of files) {
      const network = this.diagram.getNetwork(file.id)!;
      file.name = network.name;

      for (const node of file.nodes) {
        const leafNode = network.getLeafNode(node.identifier!)!;
        node.highlightIndex = leafNode.highlightIndex;
        node.moduleLevel = leafNode.moduleLevel;
      }
    }

    const file = files.splice(index, 1)[0];
    files.splice(newIndex, 0, file);
    this.setFiles(files, false);

    this.setSelectedModule(
      this.diagram.children[newIndex].getModule(selectedModule.moduleId)!
    );

    console.timeEnd("Store.moveNetwork");
  }
}

export const StoreContext = createContext(new Store());
