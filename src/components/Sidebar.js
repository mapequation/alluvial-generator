import React from "react";
import PropTypes from "prop-types";
import { Slider } from "react-semantic-ui-range";
import { Input, Menu, Sidebar as SemanticSidebar } from "semantic-ui-react";

export default function Sidebar(props) {
  return (
    <SemanticSidebar.Pushable>
      <SemanticSidebar
        as={Menu}
        animation="overlay"
        width="wide"
        direction="right"
        visible={true}
        vertical
      >
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
            label="Streamline opacity"
            labelPosition="left"
            value={props.streamlineOpacity}
          />
          <Slider
            settings={{
              start: props.streamlineOpacity,
              min: 0,
              max: 1,
              step: 0.05,
              onChange: props.onStreamlineOpacityChange
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
        <Menu.Item>
          <Input
            type="text"
            label="Module flow threshold"
            labelPosition="left"
            value={props.moduleFlowThreshold}
          />
          <Slider
            discrete
            settings={{
              start: props.moduleFlowThreshold,
              min: 0,
              max: 0.05,
              step: 0.001,
              onChange: props.onModuleFlowThresholdChange
            }}
          />
        </Menu.Item>
      </SemanticSidebar>
      <SemanticSidebar.Pusher style={{ overflow: "hidden", height: "100vh" }}>
        {props.children}
      </SemanticSidebar.Pusher>
    </SemanticSidebar.Pushable>
  );
}

Sidebar.propTypes = {
  width: PropTypes.number,
  onWidthChange: PropTypes.func,
  height: PropTypes.number,
  onHeightChange: PropTypes.func,
  streamlineFraction: PropTypes.number,
  onStreamlineFractionChange: PropTypes.func,
  streamlineOpacity: PropTypes.number,
  onStreamlineOpacityChange: PropTypes.func,
  duration: PropTypes.number,
  onDurationChange: PropTypes.func,
  moduleFlowThreshold: PropTypes.number,
  onModuleFlowThresholdChange: PropTypes.func
};
