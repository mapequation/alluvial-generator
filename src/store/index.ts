import { makeObservable, observable, action } from "mobx";
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

export class Store {
  diagram = new Diagram();

  // hack to force updates when we call updateLayout
  updateFlag = true;

  numNetworks = 0;

  height: number = 600;
  duration: number = 400;
  marginExponent: number = 5;
  moduleWidth: number = 100;
  streamlineFraction: number = 2;
  streamlineThreshold: number = 1;
  streamlineOpacity: number = 0.9;
  moduleFlowThreshold: number = 8e-3;

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
      diagram: observable,
      updateFlag: observable,
      numNetworks: observable,
      setNetworks: action,
      height: observable,
      setHeight: action,
      duration: observable,
      setDuration: action,
      marginExponent: observable,
      setMarginExponent: action,
      moduleWidth: observable,
      setModuleWidth: action,
      streamlineFraction: observable,
      setStreamlineFraction: action,
      streamlineThreshold: observable,
      setStreamlineThreshold: action,
      streamlineOpacity: observable,
      setStreamlineOpacity: action,
      moduleFlowThreshold: observable,
      setModuleFlowThreshold: action,
      defaultHighlightColor: observable,
      setDefaultHighlightColor: action,
      highlightColors: observable,
      setHighlightColors: action,
      verticalAlign: observable,
      setVerticalAlign: action,
      moduleSize: observable,
      setModuleSize: action,
      sortModulesBy: observable,
      setSortModulesBy: action,
      showModuleId: observable,
      setShowModuleId: action,
      showModuleNames: observable,
      setShowModuleNames: action,
      showNetworkNames: observable,
      setShowNetworkNames: action,
      dropShadow: observable,
      setDropShadow: action,
      fontSize: observable,
      setFontSize: action,
      selectedModule: observable,
      setSelectedModule: action,
      // methods
      updateLayout: action,
    });
  }

  setNetworks(networks: any[]) {
    console.time("Store.setNetworks");
    networks.forEach((network) => this.diagram.addNetwork(network));
    this.numNetworks = networks.length;
    this.updateLayout();
    console.timeEnd("Store.setNetworks");
  }

  setHeight(height: number) {
    this.height = height;
    this.updateLayout();
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setMarginExponent(marginExponent: number) {
    this.marginExponent = marginExponent;
    this.updateLayout();
  }

  setModuleWidth(moduleWidth: number) {
    this.moduleWidth = moduleWidth;
    this.updateLayout();
  }

  setStreamlineFraction(streamlineFraction: number) {
    this.streamlineFraction = streamlineFraction;
    this.updateLayout();
  }

  setStreamlineThreshold(streamlineThreshold: number) {
    this.streamlineThreshold = streamlineThreshold;
    this.updateLayout();
  }

  setStreamlineOpacity(streamlineOpacity: number) {
    this.streamlineOpacity = streamlineOpacity;
  }

  setModuleFlowThreshold(moduleFlowThreshold: number) {
    this.moduleFlowThreshold = moduleFlowThreshold;
    this.updateLayout();
  }

  setDefaultHighlightColor(defaultHighlightColor: string) {
    this.defaultHighlightColor = defaultHighlightColor;
  }

  setHighlightColors(highlightColors: typeof schemeSet2[]) {
    this.highlightColors = highlightColors;
  }

  setVerticalAlign(verticalAlign: "bottom" | "justify") {
    this.verticalAlign = verticalAlign;
    this.updateLayout();
  }

  setModuleSize(moduleSize: "nodes" | "flow") {
    this.moduleSize = moduleSize;
    this.updateLayout();
  }

  setSortModulesBy(sortModulesBy: "nodes" | "flow") {
    this.sortModulesBy = sortModulesBy;
    this.updateLayout();
  }

  setShowModuleId(showModuleId: boolean) {
    this.showModuleId = showModuleId;
  }

  setShowModuleNames(showModuleNames: boolean) {
    this.showModuleNames = showModuleNames;
  }

  setShowNetworkNames(showNetworkNames: boolean) {
    this.showNetworkNames = showNetworkNames;
  }

  setDropShadow(dropShadow: boolean) {
    this.dropShadow = dropShadow;
  }

  setFontSize(fontSize: number) {
    this.fontSize = fontSize;
  }

  setSelectedModule(selectedModule: Module | null) {
    this.selectedModule = selectedModule;
  }

  updateLayout() {
    this.diagram.updateLayout(
      this.height,
      this.streamlineFraction,
      this.moduleWidth,
      this.moduleFlowThreshold,
      this.verticalAlign,
      this.marginExponent,
      this.moduleSize,
      this.sortModulesBy
    );
    this.updateFlag = !this.updateFlag;
  }
}

export const StoreContext = createContext(new Store());
