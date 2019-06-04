import React, { useContext } from "react";
import { Slider } from "react-semantic-ui-range";
import { Checkbox, Header, Icon, Label, Menu, Sidebar as SemanticSidebar } from "semantic-ui-react";
import { savePng, saveSvg } from "../io/export";
import { parseState, serializeState } from "../io/serialize-state";
import MenuHeader from "./MenuHeader";
import Dispatch from "../context/Dispatch";


function LabelForSlider(props) {
  const { children, ...rest } = props;

  return (
    <div style={{ clear: "both" }}>
      <Label
        basic
        horizontal
        {...rest}
        style={{ float: "left", margin: "0.08em 0" }}
      />
      <div style={{ width: "55%", display: "inline-block", float: "right" }}>
        {children}
      </div>
    </div>
  );
}

const BlueSlider = props => <Slider color="blue" {...props}/>;

const MyCheckbox = props => <Checkbox style={{ display: "block", margin: "0.3em 0" }} {...props}/>;

export default function Sidebar(props) {
  const {
    networks,
    height,
    duration,
    moduleWidth,
    streamlineFraction,
    streamlineOpacity,
    moduleFlowThreshold,
    streamlineThreshold,
    verticalAlign,
    showModuleId,
    dropShadow,
    sidebarVisible,
    selectedModule,
    selectedModuleOpen
  } = props;

  const { dispatch } = useContext(Dispatch);

  let fileInput = null;

  const basename = networks.map(network => network.name);

  const saveSettings = () => serializeState({
    height, duration, moduleWidth, streamlineFraction,
    streamlineOpacity, streamlineThreshold, moduleFlowThreshold,
    verticalAlign, showModuleId, dropShadow
  }, "alluvial-settings.json");

  const parseSettings = () => parseState(fileInput.files[0])
    .then(value => {
      fileInput.value = "";
      dispatch({ type: "loadState", value });
    });

  const selectedModuleName = selectedModule
    ? selectedModule.name || selectedModule.largestLeafNodes.join(", ")
    : <span style={{ color: "#777" }}>No module selected</span>;


  return (
    <SemanticSidebar
      as={Menu}
      animation="overlay"
      width="wide"
      direction="right"
      visible={sidebarVisible}
      vertical
    >
      <Menu.Item header href="//www.mapequation.org/alluvial">
        <MenuHeader/>
      </Menu.Item>
      <Menu.Item
        icon='close'
        content='Hide sidebar'
        onClick={() => dispatch({ type: "sidebarVisible", value: false })}
      />
      <Menu.Item>
        <Header as="h4">Selected module</Header>
        {selectedModuleName}
        {selectedModule &&
        <Menu.Menu>
          <Menu.Item
            icon={selectedModuleOpen ? "close" : "info circle"}
            content={selectedModuleOpen ? "Show less" : "Show more"}
            onClick={() => dispatch({ type: "selectedModuleOpen", value: !selectedModuleOpen })}
          />
        </Menu.Menu>
        }
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Module settings</Header>
        <LabelForSlider content="Height" detail={height}>
          <BlueSlider
            settings={{
              start: height,
              min: 400,
              max: 2000,
              step: 10,
              onChange: value => dispatch({ type: "height", value })
            }}
          />
        </LabelForSlider>
        <LabelForSlider content="Width" detail={moduleWidth}>
          <BlueSlider
            settings={{
              start: moduleWidth,
              min: 10,
              max: 200,
              step: 10,
              onChange: value => dispatch({ type: "moduleWidth", value })
            }}
          />
        </LabelForSlider>
        <LabelForSlider content="Min. flow" detail={moduleFlowThreshold}>
          <BlueSlider
            discrete
            settings={{
              start: moduleFlowThreshold,
              min: 0,
              max: 0.02,
              step: 0.001,
              onChange: value => dispatch({ type: "moduleFlowThreshold", value })
            }}
          />
        </LabelForSlider>
        <div style={{ clear: "both", paddingTop: "0.5em" }}>
          <MyCheckbox
            label="Vertical align to bottom"
            checked={verticalAlign === "bottom"}
            onChange={(e, { checked }) => dispatch({ type: "verticalAlign", value: checked ? "bottom" : "justify" })}
          />
          <MyCheckbox
            label="Show module id"
            checked={showModuleId}
            onChange={(e, { checked }) => dispatch({ type: "showModuleId", value: checked })}
          />
          <MyCheckbox
            label="Use drop shadow"
            checked={dropShadow}
            onChange={(e, { checked }) => dispatch({ type: "dropShadow", value: checked })}
          />
        </div>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Streamline settings</Header>
        <LabelForSlider content="Relative width" detail={streamlineFraction}>
          <BlueSlider
            settings={{
              start: streamlineFraction,
              min: 0,
              max: 3,
              step: 0.1,
              onChange: value => dispatch({ type: "streamlineFraction", value })
            }}
          />
        </LabelForSlider>
        <LabelForSlider content="Min. thickness" detail={streamlineThreshold}>
          <BlueSlider
            discrete
            settings={{
              start: streamlineThreshold,
              min: 0,
              max: 2,
              step: 0.01,
              onChange: value => dispatch({ type: "streamlineThreshold", value })
            }}
          />
        </LabelForSlider>
        <LabelForSlider content="Transparency" detail={Math.round((1 - streamlineOpacity) * 100) + "%"}>
          <BlueSlider
            settings={{
              start: 1 - streamlineOpacity,
              min: 0,
              max: 1,
              step: 0.01,
              onChange: transparency => dispatch({ type: "streamlineOpacity", value: 1 - transparency })
            }}
          />
        </LabelForSlider>
        <div style={{ clear: "both" }}/>
      </Menu.Item>
      <Menu.Item>
        <LabelForSlider content="Anim. speed" detail={duration < 300 ? "🐇" : duration < 1000 ? "🐈" : "🐢"}>
          <BlueSlider
            discrete
            settings={{
              start: duration,
              min: 100,
              max: 2000,
              step: 100,
              onChange: value => dispatch({ type: "duration", value })
            }}
          />
        </LabelForSlider>
        <div style={{ clear: "both" }}/>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Export</Header>
        <Menu.Menu>
          <Menu.Item
            icon="download"
            onClick={() => saveSvg("alluvialSvg", basename + ".svg")}
            content="Download SVG"
          />
        </Menu.Menu>
        <Menu.Menu>
          <Menu.Item
            icon="image"
            onClick={() => savePng("alluvialSvg", basename + ".png")}
            content="Download PNG"
          />
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Settings</Header>
        <Menu.Menu>
          <Menu.Item
            icon="download"
            onClick={saveSettings}
            content="Save settings"
          />
        </Menu.Menu>
        <Menu.Menu>
          <label className="link item" htmlFor="upload">
            <Icon name="upload"/>Load settings
          </label>
          <input
            style={{ display: "none" }}
            type="file"
            id="upload"
            onChange={parseSettings}
            accept={".json"}
            ref={input => fileInput = input}
          />
        </Menu.Menu>
      </Menu.Item>
    </SemanticSidebar>
  );
}
