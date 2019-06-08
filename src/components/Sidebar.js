import React, { useContext, useState } from "react";
import { SketchPicker } from "react-color";
import { Slider } from "react-semantic-ui-range";
import { Checkbox, Header, Icon, Label, Menu, Popup, Portal, Sidebar as SemanticSidebar } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";
import { savePng, saveSvg } from "../io/export";
import { parseState, serializeState } from "../io/serialize-state";
import MenuHeader from "./MenuHeader";
import SelectedModule from "./SelectedModule";


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
      <div style={{ width: "50%", display: "inline-block", float: "right" }}>
        {children}
      </div>
    </div>
  );
}

const GreySlider = props => <Slider color="grey" {...props}/>;

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
    defaultHighlightColor,
    highlightColors,
    verticalAlign,
    showModuleId,
    dropShadow,
    sidebarVisible,
    selectedModule
  } = props;

  const { dispatch } = useContext(Dispatch);

  const [selectedModuleOpen, setSelectedModuleOpen] = useState(false);

  let fileInput = null;

  const basename = networks.map(network => network.name);

  const saveSettings = () => serializeState({
    height, duration, moduleWidth, moduleFlowThreshold,
    streamlineFraction, streamlineOpacity, streamlineThreshold,
    verticalAlign, showModuleId, dropShadow,
    defaultHighlightColor, highlightColors
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
        <Portal
          open={selectedModuleOpen && !!selectedModule}
          onClose={() => setSelectedModuleOpen(false)}
          trigger={<Menu.Menu>
            <Menu.Item
              icon={selectedModuleOpen ? "close" : "info circle"}
              content={selectedModuleOpen ? "Show less" : "Show more"}
              onClick={() => setSelectedModuleOpen(!selectedModuleOpen)}
            />
          </Menu.Menu>}
        >
          <SelectedModule module={selectedModule} highlightColors={highlightColors}/>
        </Portal>
        }
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Module settings</Header>
        <LabelForSlider content="Height" detail={height}>
          <GreySlider
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
          <GreySlider
            settings={{
              start: moduleWidth,
              min: 10,
              max: 200,
              step: 10,
              onChange: value => dispatch({ type: "moduleWidth", value })
            }}
          />
        </LabelForSlider>
        <LabelForSlider content="Visible flow" detail={(1 - moduleFlowThreshold) * 100 + "%"}>
          <GreySlider
            discrete
            settings={{
              start: (1 - moduleFlowThreshold) * 100,
              min: 97,
              max: 100,
              step: 0.1,
              onChange: value => dispatch({ type: "moduleFlowThreshold", value: 1 - value / 100 })
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
        <LabelForSlider content="Relative width" detail={Math.round(streamlineFraction * 100) + "%"}>
          <GreySlider
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
          <GreySlider
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
          <GreySlider
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
        <LabelForSlider content="Animation speed" detail={duration < 300 ? "🐇" : duration < 1000 ? "🐈" : "🐢"}>
          <GreySlider
            settings={{
              start: 1 / duration,
              min: 1 / 2000,
              max: 1 / 200,
              step: 1 / 2000,
              onChange: value => dispatch({ type: "duration", value: 1 / value })
            }}
          />
        </LabelForSlider>
        <div style={{ clear: "both" }}/>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Settings</Header>
        <Menu.Menu>
          <Popup
            on="click"
            basic
            trigger={<Menu.Item icon="paint brush" content="Choose color"/>}
            style={{ background: "none", backgroundImage: "none", border: "none", boxShadow: "none" }}
          >
            <SketchPicker
              disableAlpha
              color={defaultHighlightColor}
              onChangeComplete={color => dispatch({ type: "defaultHighlightColor", value: color.hex })}
              presetColors={[
                "#C27F87", "#DDBF8D", "#D0CA92", "#AE927A", "#A7CB81", "#64764F", "#D599E1", "#D4A2FF",
                "#A0BFE4", "#A6CBC1", "#BAD0A1", "#b6b69f", "#414141", "#808080", "#BFBFBF"
              ]}
            />
          </Popup>
        </Menu.Menu>
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
    </SemanticSidebar>
  );
}
