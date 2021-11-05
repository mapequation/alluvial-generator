import { Button, Header, Icon, Popup } from "semantic-ui-react";

export default function PaintNetworks({
  onAutoPaintNodesClick,
  onAutoPaintModuleIdsClick,
  onRemoveColorsClick,
}) {
  const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

  return (
    <>
      <Header as="h4" content="Paint networks" />
      <Button.Group {...buttonProps}>
        <Popup
          content="Paint nodes in all networks based on the modules in the selected network. (Select network by clicking on any module.)"
          inverted
          size="small"
          trigger={
            <Button
              content="Auto paint nodes"
              onClick={onAutoPaintNodesClick}
            />
          }
        />
        <Popup
          content="Paint modules in all networks based on the module ids in the selected network. (Select network by clicking on any module.)"
          inverted
          size="small"
          trigger={
            <Button
              content="Auto paint module ids"
              onClick={onAutoPaintModuleIdsClick}
            />
          }
        />
      </Button.Group>
      <Button.Group negative {...buttonProps} style={{ margin: "4px 0 0 0" }}>
        <Popup
          content="Use the default color for all networks."
          inverted
          size="small"
          trigger={
            <Button icon labelPosition="right" onClick={onRemoveColorsClick}>
              <Icon name="x" style={{ background: "transparent" }} />
              Remove all colors
            </Button>
          }
        />
      </Button.Group>
    </>
  );
}
