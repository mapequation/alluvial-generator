import React from "react";
import { Button, Header, Icon, Popup } from "semantic-ui-react";


const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };

export default class PaintNetworks extends React.PureComponent {
  render() {
    const { onAutoPaintClick, onRemoveColorsClick } = this.props;

    return <>
      <Header as="h4" content="Paint networks"/>
      <Button.Group {...buttonProps}>
        <Popup
          content="Paint all networks based on the modules in the selected network. (Select network by clicking on any module.)"
          inverted size="small"
          trigger={<Button content="Auto paint modules" onClick={onAutoPaintClick}/>}/>
        <Popup
          content="Use the default color for all networks."
          inverted size="small"
          trigger={<Button icon labelPosition="right" onClick={onRemoveColorsClick}>
            <Icon name="x" style={{ background: "transparent" }}/>
            Remove all colors
          </Button>
          }/>
      </Button.Group>
    </>;
  }
}
