import { action, makeObservable, observable } from "mobx";
import { createContext } from "react";
import {
  schemeDark2,
  schemePastel1,
  schemePastel2,
  schemeSet2,
  schemeTableau10,
} from "d3";
import Diagram from "../alluvial/Diagram";
import type Module from "../alluvial/Module";
import TreePath from "../utils/TreePath";
import { LEFT, RIGHT, Side } from "../alluvial/Side";
import LeafNode from "../alluvial/LeafNode";

export class Store {
  diagram = new Diagram();

  files: any[] = [];

  // hack to force updates when we call updateLayout
  updateFlag = true;

  numNetworks = 0;

  height: number = 600;
  duration: number = 0.2;
  marginExponent: number = 5;
  moduleWidth: number = 100;
  streamlineFraction: number = 2;
  streamlineThreshold: number = 1;
  streamlineOpacity: number = 0.9;
  flowThreshold: number = 8e-3;

  defaultHighlightColor: string = "#b6b69f";
  highlightColors: typeof schemeSet2[] = [].concat(
    // @ts-ignore
    schemeTableau10,
    schemeDark2,
    schemePastel1,
    schemePastel2,
    schemeSet2
  );

  verticalAlign: "bottom" | "justify" = "bottom";
  moduleSize: "nodes" | "flow" = "flow";
  sortModulesBy: "nodes" | "flow" = "flow";

  showModuleId: boolean = false;
  showModuleNames: boolean = true;
  showNetworkNames: boolean = true;

  dropShadow: boolean = false;
  fontSize: number = 10;

  selectedModule: Module | null = null;

  constructor() {
    makeObservable(this, {
      diagram: observable.ref,
      files: observable.ref,
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
      defaultHighlightColor: observable,
      highlightColors: observable,
      verticalAlign: observable,
      moduleSize: observable,
      sortModulesBy: observable,
      showModuleId: observable,
      showModuleNames: observable,
      showNetworkNames: observable,
      dropShadow: observable,
      fontSize: observable,
      selectedModule: observable,
    });
  }

  setNetworks = action((networks: any[]) => {
    console.time("Store.setNetworks");
    this.setSelectedModule(null);
    this.diagram = new Diagram(networks);
    this.numNetworks = networks.length;
    this.updateLayout();
    console.timeEnd("Store.setNetworks");
  });

  addNetwork(network: any) {
    this.diagram.addNetwork(network);
    this.numNetworks++;
    this.updateLayout();
  }

  setFiles = action((files: any[]) => {
    this.files = files;
    this.setNetworks(files);
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

  setDefaultHighlightColor = action((defaultHighlightColor: string) => {
    this.defaultHighlightColor = defaultHighlightColor;
  });

  setHighlightColors = action((highlightColors: typeof schemeSet2[]) => {
    this.highlightColors = highlightColors;
  });

  setVerticalAlign = action((verticalAlign: "bottom" | "justify") => {
    this.verticalAlign = verticalAlign;
    this.updateLayout();
  });

  setModuleSize = action((moduleSize: "nodes" | "flow") => {
    this.moduleSize = moduleSize;
    this.updateLayout();
  });

  setSortModulesBy = action((sortModulesBy: "nodes" | "flow") => {
    this.sortModulesBy = sortModulesBy;
    this.updateLayout();
  });

  setShowModuleId = action((showModuleId: boolean) => {
    this.showModuleId = showModuleId;
  });

  setShowModuleNames = action((showModuleNames: boolean) => {
    this.showModuleNames = showModuleNames;
  });

  setShowNetworkNames = action((showNetworkNames: boolean) => {
    this.showNetworkNames = showNetworkNames;
  });

  setDropShadow = action((dropShadow: boolean) => {
    this.dropShadow = dropShadow;
  });

  setFontSize = action((fontSize: number) => {
    this.fontSize = fontSize;
  });

  setNetworkName = (networkId: string) =>
    action((name: string) => {
      const network = this.diagram.getNetwork(networkId);
      if (network) {
        network.name = name;
        this.toggleUpdate();
      }
    });

  setModuleName = (module: Module) =>
    action((name: string) => {
      module.name = name;
      this.toggleUpdate();
    });

  setSelectedModule = action((selectedModule: Module | null) => {
    this.selectedModule = selectedModule;
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
    module.expand();
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
  }

  regroup(module: Module) {
    const { parent, moduleId } = module;
    module.regroup();
    this.updateLayout();

    const parentModuleId = TreePath.parentPath(moduleId)?.toString() ?? null;
    if (parentModuleId) {
      const superModule = parent.getModule(parentModuleId) ?? null;
      if (superModule != null) {
        this.setSelectedModule(superModule);
      }
    }
  }

  colorModule(module: Module, highlightIndex: number, updateLayout = true) {
    module.setColor(highlightIndex);

    if (updateLayout) {
      this.updateLayout();
    }
  }

  colorMatchingModules(module: Module, highlightIndex: number, side?: Side) {
    module.setColor(highlightIndex);

    if (!side || side === LEFT) {
      const left = module.getSimilarModules(LEFT);
      if (left.length) {
        this.colorMatchingModules(left[0].module, highlightIndex, LEFT);
      }
    }

    if (!side || side === RIGHT) {
      const right = module.getSimilarModules(RIGHT);
      if (right.length) {
        this.colorMatchingModules(right[0].module, highlightIndex, RIGHT);
      }
    }

    if (!side) this.updateLayout();
  }

  colorModuleNodesInAllNetworks(
    module: Module,
    highlightIndex: number,
    updateLayout = true
  ) {
    module.setColor(highlightIndex);

    this.diagram.children
      .filter((network) => network.networkId !== module.networkId)
      .forEach((network) =>
        [...module.leafNodes()]
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

  colorNodesInAllNetworks(networkId: string | undefined) {
    this.clearColors(false);

    const network = this.diagram.getNetwork(
      networkId ?? this.diagram.children[0].networkId
    );

    const highlightIndices = [...this.highlightColors.keys()];

    network?.children
      .filter((module) => module.isVisible)
      .forEach((module, i) => {
        const highlightIndex = highlightIndices[i % highlightIndices.length];
        this.colorModuleNodesInAllNetworks(module, highlightIndex, false);
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

  toggleUpdate = action(() => {
    this.updateFlag = !this.updateFlag;
  });

  moveSelectedModule(direction: "up" | "down") {
    if (!this.selectedModule) return;

    if (direction === "up") this.selectedModule.moveUp();
    else this.selectedModule.moveDown();

    this.diagram.updateLayout(this);
    this.toggleUpdate();
  }
}

export const StoreContext = createContext(new Store());
