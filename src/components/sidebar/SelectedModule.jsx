import { useContext, useLayoutEffect, useState } from "react";
import { GithubPicker } from "react-color";
import { Button } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";

function Swatch(props) {
  return (
    <div
      style={{
        margin: "0 1px 2px",
        padding: "4px",
        background: "#fff",
        borderRadius: "4px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "25px",
          height: "25px",
          background: props.background,
        }}
      />
    </div>
  );
}

const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

export default function SelectedModule(props) {
  const {
    module,
    highlightColors,
    defaultHighlightColor,
    selectedNetworkId,
    setSelectedNetworkId,
    moduleIds,
    setModuleIds,
  } = props;

  const { dispatch } = useContext(Dispatch);

  const [color, setColor] = useState(defaultHighlightColor);

  const highlightIndex = highlightColors.indexOf(color);

  const paintModule = () => {
    module.highlightIndex = highlightIndex;
    dispatch({ type: "changeColor" });
  };

  const paintNodes = () => {
    module.highlightIndex = highlightIndex;
    dispatch({ type: "changeNodesColor" });
  };

  const paintModuleIds = () => {
    module.highlightIndex = highlightIndex;
    dispatch({ type: "changeModuleIdsColor" });
  };

  const [buttonsEnabled, setButtonsEnabled] = useState(true);

  useLayoutEffect(() => setButtonsEnabled(true), [module]);

  const expandModule = () => {
    dispatch({ type: "expand" });
    setButtonsEnabled(false);
  };

  const contractModule = () => {
    dispatch({ type: "regroup" });
    setButtonsEnabled(false);
  };

  if (!module) {
    return;
  }

  const addToFilter = () => {
    const ids = selectedNetworkId === module.networkId ? moduleIds : [];
    setSelectedNetworkId(module.networkId);
    setModuleIds([...ids, module.moduleId]);
  };

  const removeFromFilter = () =>
    setModuleIds(moduleIds.filter((moduleId) => moduleId !== module.moduleId));

  return (
    <>
      <Button.Group {...buttonProps}>
        <Button
          icon="plus"
          content="Expand module"
          onClick={expandModule}
          disabled={
            !buttonsEnabled || module.moduleLevel === module.maxModuleLevel
          }
        />
        <Button
          icon="minus"
          content="Contract module"
          onClick={contractModule}
          disabled={!buttonsEnabled || module.moduleLevel === 1}
        />
      </Button.Group>
      <Button.Group {...buttonProps} style={{ margin: "4px 0 4px 0 " }}>
        <Button
          content="Add to module filter"
          onClick={addToFilter}
          disabled={moduleIds.includes(module.moduleId)}
        />
        <Button
          content="Remove from module filter"
          onClick={removeFromFilter}
          disabled={!moduleIds.includes(module.moduleId)}
        />
      </Button.Group>
      <Swatch background={color} />
      <GithubPicker
        colors={[defaultHighlightColor, ...highlightColors]}
        onChangeComplete={(color) => setColor(color.hex)}
      />
      <Button.Group {...buttonProps} style={{ margin: "4px 0 0 0" }}>
        <Button content="Paint module" onClick={paintModule} />
        <Button content="Paint nodes in all networks" onClick={paintNodes} />
      </Button.Group>
      <Button.Group {...buttonProps} style={{ margin: "4px 0 0 0" }}>
        <Button
          content="Paint matching module ids in all networks"
          onClick={paintModuleIds}
        />
      </Button.Group>
    </>
  );
}
