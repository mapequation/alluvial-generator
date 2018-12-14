import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Icon,
  Input,
  Menu,
  Sidebar as SemanticSidebar
} from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";

export const { Pushable, Pusher } = SemanticSidebar;

export default function Sidebar(props) {
  return (
    <SemanticSidebar
      as={Menu}
      animation="overlay"
      width="wide"
      direction="right"
      visible={true}
      vertical
    >
      <Menu.Item>
        <Button>Visible networks {props.numVisibleNetworks}</Button>
        <Button.Group>
          <Button
            icon
            onClick={props.onRemoveNetworkClick}
            disabled={props.numVisibleNetworks === 0}
          >
            <Icon name="minus" />
          </Button>
          <Button
            icon
            onClick={props.onAddNetworkClick}
            disabled={props.numVisibleNetworks === props.numNetworks}
          >
            <Icon name="plus" />
          </Button>
        </Button.Group>
      </Menu.Item>
      <Menu.Item>
        <Input
          type="text"
          label="Width"
          labelPosition="left"
          value={props.width}
          onChange={props.onWidthChange}
        />
      </Menu.Item>
      <Menu.Item>
        <Input
          type="text"
          label="Height"
          labelPosition="left"
          value={props.height}
          onChange={props.onHeightChange}
        />
      </Menu.Item>
      <Menu.Item>
        <Input
          type="text"
          label="Streamline fraction"
          labelPosition="left"
          value={props.streamlineFraction}
        />
        <Slider
          settings={{
            start: props.streamlineFraction,
            min: 0,
            max: 3,
            step: 0.1,
            onChange: props.onStreamlineFractionChange
          }}
        />
      </Menu.Item>
      <Menu.Item>
        <Input
          type="text"
          label="Animation duration"
          labelPosition="left"
          value={props.duration}
        />
        <Slider
          discrete
          settings={{
            start: props.duration,
            min: 100,
            max: 2000,
            step: 100,
            onChange: props.onDurationChange
          }}
        />
      </Menu.Item>
    </SemanticSidebar>
  );
}

Sidebar.propTypes = {
  numVisibleNetworks: PropTypes.number,
  onRemoveNetworkClick: PropTypes.func,
  onAddNetworkClick: PropTypes.func,
  numNetworks: PropTypes.number,
  width: PropTypes.number,
  onWidthChange: PropTypes.func,
  height: PropTypes.number,
  onHeightChange: PropTypes.func,
  streamlineFraction: PropTypes.number,
  onStreamlineFractionChange: PropTypes.func,
  duration: PropTypes.number,
  onDurationChange: PropTypes.func
};
