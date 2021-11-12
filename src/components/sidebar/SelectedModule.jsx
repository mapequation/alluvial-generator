import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { GithubPicker } from "react-color";
import { Button } from "semantic-ui-react";
import { StoreContext } from "../../store";

function Swatch({ background }) {
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
          background,
        }}
      />
    </div>
  );
}

const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

export default observer(function SelectedModule() {
  const store = useContext(StoreContext);
  const [color, setColor] = useState(store.defaultHighlightColor);
  const { highlightColors, defaultHighlightColor } = store;

  if (!store.selectedModule) return null;
  const module = store.selectedModule; // FIXME;

  const highlightIndex = highlightColors.indexOf(color);

  const paintModule = () => {
    module.highlightIndex = highlightIndex;
  };

  const paintNodes = () => {
    module.highlightIndex = highlightIndex;
  };

  const paintModuleIds = () => {
    module.highlightIndex = highlightIndex;
  };

  const expandModule = () => {
    module.expand();
    store.updateLayout();
  };

  const contractModule = () => {
    module.regroup();
    store.updateLayout();
  };

  return (
    <>
      <Button.Group {...buttonProps}>
        <Button
          icon="plus"
          content="Expand module"
          onClick={expandModule}
          disabled={module.moduleLevel === module.maxModuleLevel}
        />
        <Button
          icon="minus"
          content="Contract module"
          onClick={contractModule}
          disabled={module.moduleLevel === 1}
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
});
