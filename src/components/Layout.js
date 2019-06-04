import React, { useReducer } from "react";
import { Menu, Rail, Sidebar as SemanticSidebar } from "semantic-ui-react";
import AlluvialDiagram from "./AlluvialDiagram";
import SelectedModule from "./SelectedModule";
import Sidebar from "./Sidebar";
import Dispatch from "../context/Dispatch";


function reducer(state, action) {
  switch (action.type) {
    case "height":
      return { ...state, height: action.value };
    case "duration":
      return { ...state, duration: action.value };
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
    case "verticalAlign":
      return { ...state, verticalAlign: action.value };
    case "showModuleId":
      return { ...state, showModuleId: action.value };
    case "dropShadow":
      return { ...state, dropShadow: action.value };
    case "selectedModule":
      return { ...state, selectedModule: action.value };
    case "selectedModuleOpen":
      return { ...state, selectedModuleOpen: action.value };
    case "selectedModuleNameChange":
      return { ...state, selectedModuleNameChange: !state.selectedModuleNameChange };
    case "sidebarVisible":
      return { ...state, sidebarVisible: action.value };
    case "loadState":
      return { ...state, ...action.value };
    default:
      throw new Error();
  }
}

export default function Layout(props) {
  const initialState = {
    height: 600,
    duration: 400,
    moduleWidth: 100,
    streamlineFraction: 2,
    streamlineThreshold: 1,
    streamlineOpacity: 0.5,
    moduleFlowThreshold: 8e-3,
    verticalAlign: "bottom",
    showModuleId: false,
    dropShadow: false,
    selectedModule: null,
    selectedModuleOpen: false,
    selectedModuleNameChange: true,
    sidebarVisible: true
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Dispatch.Provider value={{ dispatch }}>
      <SelectedModule open={state.selectedModuleOpen} module={state.selectedModule}/>
      <SemanticSidebar.Pushable style={{ height: "100vh", overflow: "hidden" }}>
        <Sidebar {...state} {...props}/>
        <SemanticSidebar.Pusher>
          <Rail internal position="right" style={{ padding: 0, margin: 0, height: 0 }}>
            <Menu vertical>
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
