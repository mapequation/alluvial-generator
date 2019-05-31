import FileSaver from "file-saver";
import React from "react";
import { Slider } from "react-semantic-ui-range";
import {
  Button,
  Checkbox,
  Header,
  Icon,
  Image,
  Input,
  Label,
  Menu,
  Sidebar as SemanticSidebar
} from "semantic-ui-react";

import Diagram from "../alluvial/Diagram";
import readAsText from "../io/read-as-text";
import AlluvialDiagram from "./AlluvialDiagram";
import SelectedModule from "./SelectedModule";
import ShowSidebarButton from "./ShowSidebarButton";


export default class Sidebar extends React.Component {
  state = {
    height: 600,
    duration: 400,
    moduleWidth: 100,
    streamlineFraction: 2,
    streamlineOpacity: 0.5,
    moduleFlowThreshold: 8e-3,
    streamlineThreshold: 1,
    verticalAlign: "bottom",
    showModuleId: false,
    dropShadow: false,
    selectedModule: null,
    selectedModuleName: "",
    sidebarVisible: true
  };

  input = null;

  constructor(props) {
    super(props);
    this.diagram = new Diagram(props.networks);
  }

  toggleSidebar = () => this.setState(prevState => ({ sidebarVisible: !prevState.sidebarVisible }));

  saveSettings = () => {
    const settings = {
      networks: this.props.networks.map(network => network.name),
      ...this.state
    };
    const json = JSON.stringify(settings, null, 2);
    const blob = new Blob([json], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "alluvial-settings.json");
  };

  parseSettings = async () => {
    if (!this.input) {
      throw new Error("Tried to parse settings but input was null");
    }

    const settings = await readAsText(this.input.files[0]);
    this.input.value = "";

    const state = JSON.parse(settings);

    this.setState(prevState => ({
      ...prevState,
      ...state
    }));
  };

  updateLayout = () =>
    this.diagram.updateLayout(
      this.state.height,
      this.state.streamlineFraction,
      this.state.moduleWidth,
      this.state.moduleFlowThreshold,
      this.state.verticalAlign
    );

  handleModuleNameChange = selectedModuleName => {
    const { selectedModule } = this.state;
    selectedModule.name = selectedModuleName;
    this.diagram.setModuleName(selectedModule);
    this.setState({ selectedModuleName });
  };

  clearModuleName = () => this.handleModuleNameChange("");

  basename = () => this.props.networks.map(network => network.name);

  saveSvg = () => {
    const svgEl = document.getElementById("alluvialSvg");
    const svg = new XMLSerializer().serializeToString(svgEl);
    const preface = "<?xml version=\"1.0\" standalone=\"no\"?>\r\n";
    const svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });
    FileSaver.saveAs(svgBlob, this.basename() + ".svg");
  };

  savePng = () => {
    const [width, height] = [window.innerWidth, window.innerHeight];

    const svgEl = document.getElementById("alluvialSvg");
    svgEl.setAttribute("width", width);
    svgEl.setAttribute("height", height);
    const svg = new XMLSerializer().serializeToString(svgEl);
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    const image = new Image(width, height);
    image.onload = () => {
      context.drawImage(image, 0, 0);
      canvas.toBlob(blob => FileSaver.saveAs(blob, this.basename() + ".png"));
    };

    image.onerror = (err) => {
      console.error(err.type, err.message);
    };

    image.src = "data:image/svg+xml; charset=utf8, " + encodeURIComponent(svg);
  };

  render() {
    const {
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
      selectedModule,
      selectedModuleName,
      sidebarVisible
    } = this.state;

    const validNumber = value => (Number.isNaN(+value) ? 0 : +value);

    const TextInput = props =>
      <Input size="small" style={{ margin: "0.3em 0 0.3em 0" }} fluid type="text" labelPosition="left" {...props} />;

    const sidebar = <SemanticSidebar
      as={Menu}
      animation="overlay"
      width="wide"
      direction="right"
      visible={sidebarVisible}
      vertical
    >
      <Menu.Item header href="//www.mapequation.org/alluvial">
        <Header>
          <Image
            size="mini"
            verticalAlign="middle"
            src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
            alt="mapequation-icon"
          />
          <div className="content">
            <span className="brand">
              <span className="brand-infomap">Alluvial Diagram</span> <span className="brand-nn">Generator</span>
            </span>
          </div>
        </Header>
      </Menu.Item>
      <Menu.Item onClick={this.toggleSidebar} icon='close' content='Hide sidebar'/>
      <Menu.Item>
        <Header as="h4">Module settings</Header>
        <TextInput
          label="Height"
          value={height}
          onChange={(e, { value }) => this.setState({ height: validNumber(value) })}
        />
        <Slider
          color="blue"
          settings={{
            start: height,
            min: 400,
            max: 2000,
            step: 10,
            onChange: height => this.setState({ height })
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
            onChange: moduleWidth => this.setState({ moduleWidth })
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
            onChange: moduleFlowThreshold => this.setState({ moduleFlowThreshold })
          }}
        />
        <Checkbox style={{ margin: "0.3em 0 0.3em 0" }} toggle
                  onChange={(e, { checked }) => this.setState({ verticalAlign: checked ? "bottom" : "justify" })}
                  checked={verticalAlign === "bottom"} label="Vertical align to bottom"/>
        <Checkbox style={{ margin: "0.3em 0 0.3em 0" }} toggle
                  onChange={(e, { checked }) => this.setState({ showModuleId: checked })}
                  checked={showModuleId} label="Show module id"/>
        <Checkbox style={{ margin: "0.3em 0 0.3em 0" }} toggle
                  onChange={(e, { checked }) => this.setState({ dropShadow: checked })}
                  checked={dropShadow} label="Use drop shadow"/>
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
            onChange: streamlineFraction => this.setState({ streamlineFraction })
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
            onChange: streamlineThreshold => this.setState({ streamlineThreshold })
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
            onChange: transparency => this.setState({ streamlineOpacity: 1 - transparency })
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
            onChange: duration => this.setState({ duration })
          }}
        />
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Export</Header>
        <Button icon size="small" labelPosition="left" onClick={this.saveSvg}>
          <Icon name="download"/>SVG
        </Button>
        <Button icon size="small" labelPosition="left" onClick={this.savePng}>
          <Icon name="image"/>PNG
        </Button>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Settings</Header>
        <Button icon size="small" labelPosition="left" onClick={this.saveSettings}>
          <Icon name="download"/>Save
        </Button>
        <label className="ui small icon left labeled button" htmlFor="upload">
          <Icon name="upload"/>Load
        </label>
        <input
          style={{ display: "none" }}
          type="file"
          id="upload"
          onChange={this.parseSettings}
          accept={".json"}
          ref={input => (this.input = input)}
        />
      </Menu.Item>
    </SemanticSidebar>;

    return (
      <React.Fragment>
        <SelectedModule module={selectedModule}/>
        <SemanticSidebar.Pushable>
          {sidebar}
          <SemanticSidebar.Pusher style={{ overflow: "hidden", height: "100vh" }}>
            <ShowSidebarButton onClick={this.toggleSidebar}/>
            <React.StrictMode>
              <AlluvialDiagram
                diagram={this.diagram}
                height={height}
                moduleWidth={+moduleWidth}
                streamlineFraction={+streamlineFraction}
                streamlineOpacity={+streamlineOpacity}
                duration={+duration}
                moduleFlowThreshold={+moduleFlowThreshold}
                streamlineThreshold={+streamlineThreshold}
                verticalAlign={verticalAlign}
                showModuleId={showModuleId}
                dropShadow={dropShadow}
                onModuleClick={(selectedModule, selectedModuleName = "") =>
                  this.setState({ selectedModule, selectedModuleName })}
                onUpdateLayout={this.updateLayout}
              />
            </React.StrictMode>
          </SemanticSidebar.Pusher>
        </SemanticSidebar.Pushable>
      </React.Fragment>
    );
  }
}
