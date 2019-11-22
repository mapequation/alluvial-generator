import React, { useContext, useState } from "react";
import { Slider } from "react-semantic-ui-range";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  Header,
  Icon,
  Label,
  List,
  Menu,
  Modal,
  Popup,
  Sidebar as SemanticSidebar
} from "semantic-ui-react";
import Dispatch from "../context/Dispatch";
import { savePng, saveSvg } from "../io/export";
import DefaultHighlightColor from "./DefaultHighlightColor";
import MenuHeader from "./MenuHeader";
import SelectedModule from "./SelectedModule";


function LabelForSlider(props) {
  const { children, popup, ...rest } = props;

  const label = <Label
    basic
    horizontal
    {...rest}
    style={{ width: "50%", textAlign: "left", fontWeight: 400, float: "left", margin: "0.08em 0" }}
  />;

  return (
    <div style={{ clear: "both" }}>
      {popup ? <Popup content={popup} inverted size="small" trigger={label}/> : label}
      <div style={{ width: "50%", display: "inline-block", float: "right" }}>
        {children}
      </div>
    </div>
  );
}

const GreySlider = props => <Slider color="grey" value={props.start} settings={props}/>;

const MyCheckbox = props => {
  const { popup, ...rest } = props;
  const checkbox = <Checkbox style={{ display: "block", margin: "0.3em 0" }} {...rest}/>;
  return popup ? <Popup content={popup} inverted size="small" trigger={checkbox}/> : checkbox;
};

const SliderCheckbox = props => <MyCheckbox slider {...props}/>;

export default function Sidebar(props) {
  const {
    networks,
    height,
    duration,
    marginExponent,
    moduleWidth,
    streamlineFraction,
    streamlineOpacity,
    moduleFlowThreshold,
    streamlineThreshold,
    defaultHighlightColor,
    highlightColors,
    verticalAlign,
    showModuleId,
    showModuleNames,
    showNetworkNames,
    dropShadow,
    fontSize,
    sidebarVisible,
    selectedModule,
    moduleSize,
    sortModulesBy,
    visibleModules
  } = props;

  const { dispatch } = useContext(Dispatch);

  const basename = networks.map(network => network.name);

  const autoPaint = () => dispatch({ type: "autoPaint" });

  const removeColors = () => dispatch({ type: "removeColors" });

  const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const [selectedNetworkId, setSelectedNetworkId] = useState("");

  const [moduleIds, setModuleIds] = useState(new Map(networks.map(({ id }) => [id, []])));

  const networkIdOptions = networks.map(({ name, id }, key) => ({ key, text: name, value: id }));

  const moduleIdOptions = (() => {
    const visibleModuleIds = visibleModules.get(selectedNetworkId) || [];
    return visibleModuleIds.map((moduleId, key) => ({ key, text: moduleId, value: moduleId }));
  })();

  const moduleIdsForNetwork = networkId => moduleIds.get(networkId) || [];

  const moduleIdsForSelectedNetwork = moduleIdsForNetwork(selectedNetworkId);

  const setModuleIdsForNetwork = networkId => newModuleIds => {
    if (!moduleIds.has(networkId)) return;
    setModuleIds(new Map(moduleIds.set(networkId, newModuleIds)));
  };

  const setModuleIdsForSelectedNetwork = setModuleIdsForNetwork(selectedNetworkId);

  const applyFilter = () => dispatch({ type: "changeVisibleModules", value: moduleIds });

  const clearFilter = () => {
    setModuleIds(new Map(networks.map(({ id }) => [id, []])));
    dispatch({ type: "clearFilters" });
  };

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
        {!!selectedModule
          ? <SelectedModule
            module={selectedModule}
            highlightColors={highlightColors}
            defaultHighlightColor={defaultHighlightColor}
            selectedNetworkId={selectedNetworkId}
            setSelectedNetworkId={setSelectedNetworkId}
            moduleIds={moduleIdsForNetwork(selectedModule.networkId)}
            setModuleIds={setModuleIdsForNetwork(selectedModule.networkId)}
          />
          : <div style={{ color: "#777" }}>No module selected. <br/>Click on any module.</div>
        }
      </Menu.Item>
      <Menu.Item>
        <Header as="h4" content="Module filter"/>
        <Dropdown
          placeholder="Select network"
          selection
          clearable
          onChange={(e, { value }) => {
            if (value === "") {
              clearFilter();
            }
            setSelectedNetworkId(value);
          }}
          value={selectedNetworkId}
          options={networkIdOptions}
        />
        {selectedNetworkId !== "" &&
        <Form>
          <Dropdown
            placeholder="Select module ids to include"
            fluid
            autoComplete="on"
            allowAdditions={false}
            multiple
            search
            selection
            options={moduleIdOptions}
            value={moduleIdsForSelectedNetwork}
            onChange={(e, { value }) => setModuleIdsForSelectedNetwork(value)}
          />
          <Button.Group
            style={{ margin: "4px 0 0 0 " }}
            {...buttonProps}
          >
            <Button
              type="submit"
              onClick={applyFilter}
              content="Apply filter"
            />
          </Button.Group>
        </Form>
        }
        <Button.Group
          style={{ margin: "4px 0 0 0 " }}
          {...buttonProps}
        >
          <Button
            onClick={clearFilter}
            icon
            labelPosition="right">
            <Icon name="x" style={{ background: "transparent" }}/>
            Clear filter
          </Button>
        </Button.Group>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4" content="Paint networks"/>
        <Button.Group {...buttonProps}>
          <Popup
            content="Paint all networks based on the modules in the selected network. (Select network by clicking on any module.)"
            inverted size="small"
            trigger={
              <Button
                content="Auto paint modules"
                onClick={autoPaint}
              />
            }/>
          <Popup
            content="Use the default color for all networks."
            inverted size="small"
            trigger={
              <Button
                icon
                labelPosition="right"
                onClick={removeColors}
              >
                <Icon name="x" style={{ background: "transparent" }}/>
                Remove all colors
              </Button>
            }/>
        </Button.Group>
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Layout</Header>
        <LabelForSlider
          content="Height"
          detail={height}
          popup="Total height (arbitrary units)."
        >
          <GreySlider
            start={height}
            min={400}
            max={2000}
            step={10}
            onChange={value => dispatch({ type: "height", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Module width"
          detail={moduleWidth}
          popup="Width of each stack of modules (arbitrary units)."
        >
          <GreySlider
            start={moduleWidth}
            min={10}
            max={200}
            step={10}
            onChange={value => dispatch({ type: "moduleWidth", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Module spacing"
          detail={Math.round(streamlineFraction * 100) + "%"}
          popup="Relative streamline width to module width."
        >
          <GreySlider
            start={streamlineFraction}
            min={0}
            max={10}
            step={0.1}
            onChange={value => dispatch({ type: "streamlineFraction", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Margin"
          detail={2 ** (marginExponent - 1)}
          popup="Margin between top-level modules. Sub-modules are spaced closer together."
        >
          <GreySlider
            start={marginExponent}
            min={1}
            max={10}
            step={1}
            onChange={value => dispatch({ type: "marginExponent", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Visible flow"
          detail={(1 - moduleFlowThreshold) * 100 + "%"}
          popup="Show modules that together contain this much flow of information."
        >
          <GreySlider
            start={(1 - moduleFlowThreshold) * 100}
            min={97}
            max={100}
            step={0.1}
            onChange={value => dispatch({ type: "moduleFlowThreshold", value: 1 - value / 100 })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Streamline filter"
          detail={streamlineThreshold}
          popup="Show streamlines that are at least this tall."
        >
          <GreySlider
            start={streamlineThreshold}
            min={0}
            max={2}
            step={0.01}
            onChange={value => dispatch({ type: "streamlineThreshold", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Transparency"
          detail={Math.round((1 - streamlineOpacity) * 100) + "%"}
          popup="Increase transparency to highlight overlapping streamlines."
        >
          <GreySlider
            start={1 - streamlineOpacity}
            min={0}
            max={1}
            step={0.01}
            onChange={transparency => dispatch({ type: "streamlineOpacity", value: 1 - transparency })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Font size"
          detail={fontSize}
          popup="Font size for module and network names."
        >
          <GreySlider
            start={fontSize}
            min={5}
            max={40}
            step={1}
            onChange={value => dispatch({ type: "fontSize", value })}
          />
        </LabelForSlider>
        <LabelForSlider
          content="Animation speed"
          detail={duration < 300 ? "🐇" : duration < 1000 ? "🐈" : "🐢"}
          popup="Faster or slower animation speed."
        >
          <GreySlider
            start={1 / duration}
            min={1 / 2000}
            max={1 / 200}
            step={1 / 2000}
            onChange={value => dispatch({ type: "duration", value: 1 / value })}
          />
        </LabelForSlider>
        <div style={{ clear: "both", paddingTop: "0.5em" }}>
          <SliderCheckbox
            label={`Module size based on: ${moduleSize}`}
            checked={moduleSize === "flow"}
            onChange={(e, { checked }) => dispatch({ type: "moduleSize", value: checked ? "flow" : "nodes" })}
            popup="The height of the modules can be proportional to the flow or the number of nodes in the module."
          />
          <SliderCheckbox
            label={`Sort modules by: ${sortModulesBy}`}
            checked={sortModulesBy === "flow"}
            onChange={(e, { checked }) => dispatch({ type: "sortModulesBy", value: checked ? "flow" : "nodes" })}
            popup="Modules can be sorted by flow or the number of nodes."
          />
          <MyCheckbox
            label="Bottom align"
            checked={verticalAlign === "bottom"}
            onChange={(e, { checked }) => dispatch({ type: "verticalAlign", value: checked ? "bottom" : "justify" })}
            popup="Justify vertical module alignment or align modules to bottom."
          />
          <MyCheckbox
            label="Show module ids"
            checked={showModuleId}
            onChange={(e, { checked }) => dispatch({ type: "showModuleId", value: checked })}
            popup="Show or hide module designations. (Visible on top of modules.)"
          />
          <MyCheckbox
            label="Show module names"
            checked={showModuleNames}
            onChange={(e, { checked }) => dispatch({ type: "showModuleNames", value: checked })}
            popup="Show or hide module names. (Visible to the left and right of outermost networks.)"
          />
          <MyCheckbox
            label="Show network names"
            checked={showNetworkNames}
            onChange={(e, { checked }) => dispatch({ type: "showNetworkNames", value: checked })}
            popup="Show or hide network names. (Visible below each network.)"
          />
          <MyCheckbox
            label="Drop shadow"
            checked={dropShadow}
            onChange={(e, { checked }) => dispatch({ type: "dropShadow", value: checked })}
            popup="Use drop shadow on modules. Sub-modules use drop shadow with less radius than top-level modules. (Slow)"
          />
        </div>
        <DefaultHighlightColor
          defaultHighlightColor={defaultHighlightColor}
          onChange={value => dispatch({ type: "defaultHighlightColor", value })}
        />
      </Menu.Item>
      <Menu.Item>
        <Header as="h4">Export</Header>
        <Menu.Menu>
          <Menu.Item
            icon="download"
            onClick={() => dispatch({ type: "saveDiagram" })}
            content="Save diagram"
          />
        </Menu.Menu>
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
        <Menu.Menu>
          <Menu.Item
            icon="help"
            onClick={() => setPdfModalOpen(true)}
            content="Converting to PDF"
          />
        </Menu.Menu>
      </Menu.Item>
      <Modal
        size="small"
        dimmer="inverted"
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      >
        <Modal.Header>Converting to PDF</Modal.Header>
        <Modal.Content>
          <p>Currently, export to PDF does not work.</p>
          <p>The easiest way to convert to PDF is to download the diagram as SVG and convert from SVG to PDF.</p>

          <Header as='h3'>How to convert SVG to PDF</Header>
          <List ordered>
            <List.Item>Download the diagram as SVG</List.Item>
            <List.Item>Open the SVG in your browser</List.Item>
            <List.Item>Open the <i>print dialog</i> (Ctrl-P on Windows, &#8984;P on Mac)</List.Item>
            <List.Item>Choose <i>Print to PDF</i></List.Item>
          </List>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setPdfModalOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </SemanticSidebar>
  );
}
