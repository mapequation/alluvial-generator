import { schemePaired } from "d3";
import React, { useReducer } from "react";
import { Menu, Rail, Sidebar as SemanticSidebar } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";
import AlluvialDiagram from "./AlluvialDiagram";
import Sidebar from "./Sidebar";


const flip = bit => bit ? 0 : 1;

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
    case "changeAllColor":
      return { ...state, colorChangeAllBit: flip(state.colorChangeAllBit) };
    case "autoPaint":
      return { ...state, autoPaintBit: flip(state.autoPaintBit) };
    case "removeColors":
      return { ...state, removeColorsBit: flip(state.removeColorsBit) };
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
    streamlineOpacity: 0.6,
    moduleFlowThreshold: 8e-3,
    defaultHighlightColor: "#b6b69f",
    highlightColors: schemePaired,
    verticalAlign: "bottom",
    showModuleId: false,
    showModuleNames: true,
    showNetworkNames: true,
    dropShadow: false,
    fontSize: 10,
    selectedModule: null,
    nameChangeBit: 0,
    colorChangeBit: 0,
    colorChangeAllBit: 0,
    autoPaintBit: 0,
    removeColorsBit: 0,
    expandBit: 0,
    regroupBit: 0,
    saveDiagramBit: 0,
    sidebarVisible: true,
    moduleSize: "flow",
    ...props.state
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Dispatch.Provider value={{ dispatch }}>
      <SemanticSidebar.Pushable style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar {...state} {...props}/>
        <SemanticSidebar.Pusher>
          <Rail internal position="right" style={{ padding: 0, margin: 0, height: 0, width: "182px" }}>
            <Menu vertical size="small">
              <Menu.Item
                icon="sidebar"
                content="Show sidebar"
                onClick={() => dispatch({ type: "sidebarVisible", value: true })}
              />
            </Menu>
          </Rail>
          <React.StrictMode>
            <AlluvialDiagram {...state} {...props}/>
          </React.StrictMode>
        </SemanticSidebar.Pusher>
      </SemanticSidebar.Pushable>
    </Dispatch.Provider>
  );
}
