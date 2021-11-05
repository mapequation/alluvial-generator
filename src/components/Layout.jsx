import {
  schemeTableau10,
  schemeDark2,
  schemePastel1,
  schemePastel2,
  schemeSet2,
} from "d3";
import { StrictMode, useReducer } from "react";
import { Menu, Rail, Sidebar as SemanticSidebar } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";
import AlluvialDiagram from "./AlluvialDiagram";
import Sidebar from "./sidebar/Sidebar";

const flip = (bit) => (bit ? 0 : 1);

function reducer(state, action) {
  switch (action.type) {
    case "height":
      return { ...state, height: action.value };
    case "duration":
      return { ...state, duration: action.value };
    case "marginExponent":
      return { ...state, marginExponent: action.value };
    case "moduleWidth":
      return { ...state, moduleWidth: action.value };
    case "streamlineFraction":
      return { ...state, streamlineFraction: action.value };
    case "streamlineOpacity":
      return { ...state, streamlineOpacity: action.value };
    case "moduleFlowThreshold":
      return { ...state, moduleFlowThreshold: action.value };
    case "streamlineThreshold":
      return { ...state, streamlineThreshold: action.value };
    case "defaultHighlightColor":
      return { ...state, defaultHighlightColor: action.value };
    case "verticalAlign":
      return { ...state, verticalAlign: action.value };
    case "showModuleId":
      return { ...state, showModuleId: action.value };
    case "showModuleNames":
      return { ...state, showModuleNames: action.value };
    case "showNetworkNames":
      return { ...state, showNetworkNames: action.value };
    case "dropShadow":
      return { ...state, dropShadow: action.value };
    case "fontSize":
      return { ...state, fontSize: action.value };
    case "selectedModule":
      return { ...state, selectedModule: action.value };
    case "changeName":
      return { ...state, nameChangeBit: flip(state.nameChangeBit) };
    case "changeColor":
      return { ...state, colorChangeBit: flip(state.colorChangeBit) };
    case "changeNodesColor":
      return { ...state, colorChangeNodesBit: flip(state.colorChangeNodesBit) };
    case "changeModuleIdsColor":
      return {
        ...state,
        colorChangeModuleIdsBit: flip(state.colorChangeModuleIdsBit),
      };
    case "autoPaintNodes":
      return { ...state, autoPaintNodesBit: flip(state.autoPaintNodesBit) };
    case "autoPaintModuleIds":
      return {
        ...state,
        autoPaintModuleIdsBit: flip(state.autoPaintModuleIdsBit),
      };
    case "removeColors":
      return { ...state, removeColorsBit: flip(state.removeColorsBit) };
    case "highlightNodes":
      return {
        ...state,
        highlightNodesBit: flip(state.highlightNodesBit),
        highlightedNodes: action.value,
      };
    case "expand":
      return { ...state, expandBit: flip(state.expandBit) };
    case "regroup":
      return { ...state, regroupBit: flip(state.regroupBit) };
    case "saveDiagram":
      return { ...state, saveDiagramBit: flip(state.saveDiagramBit) };
    case "sidebarVisible":
      return { ...state, sidebarVisible: action.value };
    case "moduleSize":
      return { ...state, moduleSize: action.value };
    case "sortModulesBy":
      return { ...state, sortModulesBy: action.value };
    case "setVisibleModules":
      return { ...state, visibleModules: action.value };
    case "changeVisibleModules":
      return { ...state, modulesVisibleInFilter: action.value };
    case "clearFilters":
      return {
        ...state,
        clearFiltersBit: flip(state.clearFiltersBit),
        modulesVisibleInFilter: {},
      };
    default:
      throw new Error();
  }
}

export default function Layout(props) {
  const initialState = {
    height: 600,
    duration: 400,
    marginExponent: 5,
    moduleWidth: 100,
    streamlineFraction: 2,
    streamlineThreshold: 1,
    streamlineOpacity: 0.9,
    moduleFlowThreshold: 8e-3,
    defaultHighlightColor: "#b6b69f",
    highlightColors: [].concat(
      schemeTableau10,
      schemeDark2,
      schemePastel1,
      schemePastel2,
      schemeSet2
    ),
    verticalAlign: "bottom",
    showModuleId: false,
    showModuleNames: true,
    showNetworkNames: true,
    dropShadow: false,
    fontSize: 10,
    selectedModule: null,
    nameChangeBit: 0,
    colorChangeBit: 0,
    colorChangeNodesBit: 0,
    colorChangeModuleIdsBit: 0,
    autoPaintNodesBit: 0,
    autoPaintModuleIdsBit: 0,
    removeColorsBit: 0,
    highlightNodesBit: 0,
    highlightedNodes: [],
    expandBit: 0,
    regroupBit: 0,
    saveDiagramBit: 0,
    sidebarVisible: true,
    moduleSize: "flow",
    sortModulesBy: "flow",
    visibleModules: {},
    modulesVisibleInFilter: {},
    clearFiltersBit: 0,
    ...props.state,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const sharedProps = {
    height: state.height,
    duration: state.duration,
    marginExponent: state.marginExponent,
    moduleWidth: state.moduleWidth,
    streamlineFraction: state.streamlineFraction,
    streamlineThreshold: state.streamlineThreshold,
    streamlineOpacity: state.streamlineOpacity,
    moduleFlowThreshold: state.moduleFlowThreshold,
    defaultHighlightColor: state.defaultHighlightColor,
    highlightColors: state.highlightColors,
    verticalAlign: state.verticalAlign,
    showModuleId: state.showModuleId,
    showModuleNames: state.showModuleNames,
    showNetworkNames: state.showNetworkNames,
    dropShadow: state.dropShadow,
    fontSize: state.fontSize,
    selectedModule: state.selectedModule,
    moduleSize: state.moduleSize,
    sortModulesBy: state.sortModulesBy,
    visibleModules: state.visibleModules,
    modulesVisibleInFilter: state.modulesVisibleInFilter,
  };

  const sidebarProps = {
    sidebarVisible: state.sidebarVisible,
  };

  const alluvialProps = {
    clearFiltersBit: state.clearFiltersBit,
    nameChangeBit: state.nameChangeBit,
    colorChangeBit: state.colorChangeBit,
    colorChangeNodesBit: state.colorChangeNodesBit,
    colorChangeModuleIdsBit: state.colorChangeModuleIdsBit,
    autoPaintNodesBit: state.autoPaintNodesBit,
    autoPaintModuleIdsBit: state.autoPaintModuleIdsBit,
    removeColorsBit: state.removeColorsBit,
    highlightNodesBit: state.highlightNodesBit,
    highlightedNodes: state.highlightedNodes,
    expandBit: state.expandBit,
    regroupBit: state.regroupBit,
    saveDiagramBit: state.saveDiagramBit,
  };

  return (
    <Dispatch.Provider value={{ dispatch }}>
      <SemanticSidebar.Pushable style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar {...sidebarProps} {...sharedProps} {...props} />
        <SemanticSidebar.Pusher>
          <Rail
            internal
            position="right"
            style={{ padding: 0, margin: 0, height: 0, width: "182px" }}
          >
            <Menu vertical size="small">
              <Menu.Item
                icon="sidebar"
                content="Show sidebar"
                onClick={() =>
                  dispatch({ type: "sidebarVisible", value: true })
                }
              />
            </Menu>
          </Rail>
          <StrictMode>
            <AlluvialDiagram {...alluvialProps} {...sharedProps} {...props} />
          </StrictMode>
        </SemanticSidebar.Pusher>
      </SemanticSidebar.Pushable>
    </Dispatch.Provider>
  );
}
