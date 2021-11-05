import React from "react";
import { Slider } from "react-semantic-ui-range";
import { Checkbox, Header, Popup } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";
import DefaultHighlightColor from "./DefaultHighlightColor";
import LabelForSlider from "./LabelForSlider";


const GreySlider = props => <Slider color="grey" value={props.start} settings={props}/>;

const MyCheckbox = props => {
  const { popup, ...rest } = props;
  const checkbox = <Checkbox style={{ display: "block", margin: "0.3em 0" }} {...rest}/>;
  return popup ? <Popup content={popup} inverted size="small" trigger={checkbox}/> : checkbox;
};

const SliderCheckbox = props => <MyCheckbox slider {...props}/>;

export default class LayoutSettings extends React.PureComponent {
  static contextType = Dispatch;

  render() {
    const {
      height,
      moduleWidth,
      streamlineFraction,
      marginExponent,
      moduleFlowThreshold,
      streamlineThreshold,
      streamlineOpacity,
      fontSize,
      duration,
      moduleSize,
      sortModulesBy,
      verticalAlign,
      showModuleId,
      showModuleNames,
      showNetworkNames,
      dropShadow,
      defaultHighlightColor
    } = this.props;

    const { dispatch } = this.context;

    return <>
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
    </>;
  }
}
