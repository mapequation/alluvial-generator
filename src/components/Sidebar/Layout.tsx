import { observer } from "mobx-react";
import { useContext } from "react";
import { MdRestartAlt } from "react-icons/md";
import { StoreContext } from "../../store";
import {
  ListItemButton,
  ListItemHeader,
  RadioGroup,
  Slider,
  Switch,
} from "./utils";

interface LayoutProps {
  headerColor: string;
}

export default observer(function Layout({ headerColor }: LayoutProps) {
  const store = useContext(StoreContext);

  return (
    <>
      <ListItemHeader color={headerColor}>Layout</ListItemHeader>

      <ListItemButton
        onClick={() => store.resetLayout()}
        leftIcon={<MdRestartAlt />}
      >
        Sort modules
      </ListItemButton>

      <Slider
        label="Height"
        value={store.height}
        min={400}
        max={2000}
        step={10}
        onChange={store.setHeight}
        valueLabelFormat={undefined}
      />
      <Slider
        label="Module width"
        value={store.moduleWidth}
        min={10}
        max={200}
        step={10}
        onChange={store.setModuleWidth}
        valueLabelFormat={undefined}
      />
      <Slider
        label="Streamline width"
        value={store.streamlineFraction}
        min={0}
        max={10}
        step={0.1}
        valueLabelFormat={(value: number) => Math.round(value * 100) + "%"}
        onChange={store.setStreamlineFraction}
      />
      <Slider
        label="Module top margin"
        value={store.marginExponent}
        min={1}
        max={6}
        valueLabelFormat={(value: number) => 2 ** (value - 1)}
        onChange={store.setMarginExponent}
      />
      <Slider
        label="Visible flow"
        value={(1 - store.flowThreshold) * 100}
        min={95}
        max={100}
        step={0.1}
        valueLabelFormat={(value: number) => value + "%"}
        onChange={(value: number) => store.setFlowThreshold(1 - value / 100)}
      />
      <Slider
        label="Streamline filter"
        value={store.streamlineThreshold}
        min={0}
        max={5}
        step={0.01}
        onChange={store.setStreamlineThreshold}
        valueLabelFormat={undefined}
      />
      <Slider
        label="Transparency"
        value={1 - store.streamlineOpacity}
        min={0}
        max={1}
        step={0.01}
        valueLabelFormat={(value: number) =>
          Math.round((1 - value) * 100) + "%"
        }
        onChange={(value: number) => store.setStreamlineOpacity(1 - value)}
      />
      <Slider
        label="Module font size"
        value={store.fontSize}
        min={2}
        max={20}
        onChange={store.setFontSize}
        valueLabelFormat={undefined}
      />
      <Slider
        label="Network font size"
        value={store.networkFontSize}
        min={5}
        max={40}
        onChange={store.setNetworkFontSize}
        valueLabelFormat={undefined}
      />

      <RadioGroup
        legend="Hierarchical modules"
        value={store.hierarchicalModules}
        onChange={store.setHierarchicalModules}
        options={["none", "shadow", "outline"]}
      />

      <RadioGroup
        legend="Module size"
        value={store.moduleSize}
        onChange={store.setModuleSize}
        options={["flow", "nodes"]}
      />

      <RadioGroup
        legend="Module order"
        value={store.sortModulesBy}
        onChange={store.setSortModulesBy}
        options={["flow", "nodes"]}
      />

      <Switch
        label="Bottom align"
        isChecked={store.verticalAlign === "bottom"}
        onChange={(value: boolean) =>
          store.setVerticalAlign(value ? "bottom" : "justify")
        }
      />
      <Switch
        label="Module ids"
        isChecked={store.showModuleId}
        onChange={store.setShowModuleId}
      />
      <Switch
        label="Module names"
        isChecked={store.showModuleNames}
        onChange={store.setShowModuleNames}
      />
      {store.diagram.children.some((network) => network.isHigherOrder) && (
        <Switch
          label="Aggregate states names"
          isChecked={store.aggregateStateNames}
          onChange={store.setAggregateStateNames}
        />
      )}
      <Switch
        label="Network names"
        isChecked={store.showNetworkNames}
        onChange={store.setShowNetworkNames}
      />
      <Switch
        label="Adaptive font size"
        isChecked={store.adaptiveFontSize}
        onChange={store.setAdaptiveFontSize}
      />
      <Switch
        label="Drop shadow"
        isChecked={store.dropShadow}
        onChange={store.setDropShadow}
      />
    </>
  );
});