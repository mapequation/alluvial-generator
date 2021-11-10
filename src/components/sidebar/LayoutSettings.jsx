import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { Checkbox, Header, Popup } from "semantic-ui-react";
import { StoreContext } from "../../store";
import DefaultHighlightColor from "./DefaultHighlightColor";
import LabelForSlider from "./LabelForSlider";

const GreySlider = ({ start, onChange, ...props }) => (
  <Slider defaultValue={start} onChangeEnd={onChange} {...props}>
    <SliderTrack bg="gray.200">
      <SliderFilledTrack bg="gray.500" />
    </SliderTrack>
    <SliderThumb />
  </Slider>
);

const MyCheckbox = ({ popup, ...rest }) => {
  const checkbox = (
    <Checkbox style={{ display: "block", margin: "0.3em 0" }} {...rest} />
  );

  return popup ? (
    <Popup content={popup} inverted size="small" trigger={checkbox} />
  ) : (
    checkbox
  );
};

const SliderCheckbox = (props) => <MyCheckbox slider {...props} />;

export default observer(function LayoutSettings() {
  const store = useContext(StoreContext);

  return (
    <>
      <Header as="h4">Layout</Header>
      <LabelForSlider
        content="Height"
        detail={store.height}
        popup="Total height (arbitrary units)."
      >
        <GreySlider
          start={store.height}
          min={400}
          max={2000}
          step={10}
          onChange={(value) => store.setHeight(value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Module width"
        detail={store.moduleWidth}
        popup="Width of each stack of modules (arbitrary units)."
      >
        <GreySlider
          start={store.moduleWidth}
          min={10}
          max={200}
          step={10}
          onChange={(value) => store.setModuleWidth(value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Module spacing"
        detail={Math.round(store.streamlineFraction * 100) + "%"}
        popup="Relative streamline width to module width."
      >
        <GreySlider
          start={store.streamlineFraction}
          min={0}
          max={10}
          step={0.1}
          onChange={(value) => {
            return store.setStreamlineFraction(value);
          }}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Margin"
        detail={2 ** (store.marginExponent - 1)}
        popup="Margin between top-level modules. Sub-modules are spaced closer together."
      >
        <GreySlider
          start={store.marginExponent}
          min={1}
          max={10}
          step={1}
          onChange={(value) => store.setMarginExponent(value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Visible flow"
        detail={(1 - store.moduleFlowThreshold) * 100 + "%"}
        popup="Show modules that together contain this much flow of information."
      >
        <GreySlider
          start={(1 - store.moduleFlowThreshold) * 100}
          min={97}
          max={100}
          step={0.1}
          onChange={(value) => store.setModuleFlowThreshold(1 - value / 100)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Streamline filter"
        detail={store.streamlineThreshold}
        popup="Show streamlines that are at least this tall."
      >
        <GreySlider
          start={store.streamlineThreshold}
          min={0}
          max={2}
          step={0.01}
          onChange={(value) => store.setStreamlineThreshold(value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Transparency"
        detail={Math.round((1 - store.streamlineOpacity) * 100) + "%"}
        popup="Increase transparency to highlight overlapping streamlines."
      >
        <GreySlider
          start={1 - store.streamlineOpacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => store.setStreamlineOpacity(1 - value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Font size"
        detail={store.fontSize}
        popup="Font size for module and network names."
      >
        <GreySlider
          start={store.fontSize}
          min={5}
          max={40}
          step={1}
          onChange={(value) => store.setFontSize(value)}
        />
      </LabelForSlider>
      <LabelForSlider
        content="Animation speed"
        detail={
          store.duration < 300 ? "🐇" : store.duration < 1000 ? "🐈" : "🐢"
        }
        popup="Faster or slower animation speed."
      >
        <GreySlider
          start={1 / store.duration}
          min={1 / 2000}
          max={1 / 200}
          step={1 / 2000}
          onChange={(value) => store.setDuration(1 / value)}
        />
      </LabelForSlider>
      <div style={{ clear: "both", paddingTop: "0.5em" }}>
        <SliderCheckbox
          label={`Module size based on: ${store.moduleSize}`}
          checked={store.moduleSize === "flow"}
          onChange={(_, { checked }) =>
            store.setModuleSize(checked ? "flow" : "nodes")
          }
          popup="The height of the modules can be proportional to the flow or the number of nodes in the module."
        />
        <SliderCheckbox
          label={`Sort modules by: ${store.sortModulesBy}`}
          checked={store.sortModulesBy === "flow"}
          onChange={(_, { checked }) =>
            store.setSortModulesBy(checked ? "flow" : "nodes")
          }
          popup="Modules can be sorted by flow or the number of nodes."
        />
        <MyCheckbox
          label="Bottom align"
          checked={store.verticalAlign === "bottom"}
          onChange={(_, { checked }) =>
            store.setVerticalAlign(checked ? "bottom" : "justify")
          }
          popup="Justify vertical module alignment or align modules to bottom."
        />
        <MyCheckbox
          label="Show module ids"
          checked={store.showModuleId}
          onChange={(_, { checked }) => store.setShowModuleId(checked)}
          popup="Show or hide module designations. (Visible on top of modules.)"
        />
        <MyCheckbox
          label="Show module names"
          checked={store.showModuleNames}
          onChange={(_, { checked }) => store.setShowModuleNames(checked)}
          popup="Show or hide module names. (Visible to the left and right of outermost networks.)"
        />
        <MyCheckbox
          label="Show network names"
          checked={store.showNetworkNames}
          onChange={(_, { checked }) => store.setShowNetworkNames(checked)}
          popup="Show or hide network names. (Visible below each network.)"
        />
        <MyCheckbox
          label="Drop shadow"
          checked={store.dropShadow}
          onChange={(_, { checked }) => store.setDropShadow(checked)}
          popup="Use drop shadow on modules. Sub-modules use drop shadow with less radius than top-level modules. (Slow)"
        />
      </div>
      <DefaultHighlightColor
        defaultHighlightColor={store.defaultHighlightColor}
        onChange={(value) => store.setDefaultHighlightColor(value)}
      />
    </>
  );
});
