import React, { useContext } from "react";
import { Slider } from "react-semantic-ui-range";
import { Checkbox, Header, Icon, Input, Label, Menu, Sidebar as SemanticSidebar } from "semantic-ui-react";
import { savePng, saveSvg } from "../io/export";
import { parseState, serializeState } from "../io/serialize-state";
import MenuHeader from "./MenuHeader";
import Dispatch from "../context/Dispatch";


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

  const validNumber = value => (Number.isNaN(+value) ? 0 : +value);

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

  const TextInput = props =>
    <Input size="small" style={{ margin: "0.3em 0 0.3em 0" }} fluid type="text" labelPosition="left" {...props} />;

  const selectedModuleName = selectedModule
    ? selectedModule.name || selectedModule.largestLeafNodes.join(", ")
    : "No module selected";

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
        <TextInput
          label="Height"
          value={height}
          onChange={(e, { value }) => dispatch({ type: "height", value: validNumber(value) })}
        />
        <Slider
          color="blue"
          settings={{
            start: height,
            min: 400,
            max: 2000,
            step: 10,
            onChange: value => dispatch({ type: "height", value })
          }}
        />
        <TextInput
          label="Width"
          value={moduleWidth}
        />
        <Slider
          color="blue"
          settings={{
            start: moduleWidth,
            min: 10,
            max: 200,
            step: 10,
            onChange: value => dispatch({ type: "moduleWidth", value })
          }}
        />
        <TextInput
          label="Flow threshold"
          value={moduleFlowThreshold}
        />
        <Slider
          color="blue"
          discrete
          settings={{
            start: moduleFlowThreshold,
            min: 0,
            max: 0.02,
            step: 0.001,
            onChange: value => dispatch({ type: "moduleFlowThreshold", value })
          }}
        />
        <Checkbox
          style={{ margin: "0.3em 0 0.3em 0" }} toggle
          onChange={(e, { checked }) => dispatch({ type: "verticalAlign", value: checked ? "bottom" : "justify" })}
          checked={verticalAlign === "bottom"} label="Vertical align to bottom"
        />
        <Checkbox
          style={{ margin: "0.3em 0 0.3em 0" }} toggle
          onChange={(e, { checked }) => dispatch({ type: "showModuleId", value: checked })}
          checked={showModuleId} label="Show module id"
        />
        <Checkbox
          style={{ margin: "0.3em 0 0.3em 0" }} toggle
          onChange={(e, { checked }) => dispatch({ type: "dropShadow", value: checked })}
          checked={dropShadow} label="Use drop shadow"
        />
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Streamline settings</Header>
        <TextInput
          label="Fraction of module width"
          value={streamlineFraction}
        />
        <Slider
          color="blue"
          settings={{
            start: streamlineFraction,
            min: 0,
            max: 3,
            step: 0.1,
            onChange: value => dispatch({ type: "streamlineFraction", value })
          }}
        />
        <TextInput
          label="Minimum thickness"
          value={streamlineThreshold}
        />
        <Slider
          color="blue"
          discrete
          settings={{
            start: streamlineThreshold,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: value => dispatch({ type: "streamlineThreshold", value })
          }}
        />
        <TextInput value={Math.round((1 - streamlineOpacity) * 100)} labelPosition="right">
          <Label>Transparency</Label>
          <input/>
          <Label basic>%</Label>
        </TextInput>
        <Slider
          color="blue"
          settings={{
            start: 1 - streamlineOpacity,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: transparency => dispatch({ type: "streamlineOpacity", value: 1 - transparency })
          }}
        />
      </Menu.Item>
      <Menu.Item>
        <TextInput value={duration} labelPosition="right">
          <Label>Animation duration</Label>
          <input/>
          <Label basic>ms</Label>
        </TextInput>
        <Slider
          color="blue"
          discrete
          settings={{
            start: duration,
            min: 100,
            max: 2000,
            step: 100,
            onChange: value => dispatch({ type: "duration", value })
          }}
        />
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
