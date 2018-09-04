import React from "react";
import { Button, Menu, Icon, Input, Sidebar } from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";
import * as PropTypes from "prop-types";


export default function MySidebar(props) {
    return <Sidebar as={Menu}
                    animation="overlay"
                    width="wide"
                    direction="right"
                    visible={true}
                    vertical>
        <Menu.Item>
            <Button>Visible networks {props.numVisibleNetworks}</Button>
            <Button.Group>
                <Button icon onClick={props.onRemoveNetworkClick}
                        disabled={props.numVisibleNetworks === 1}>
                    <Icon name="minus"/>
                </Button>
                <Button icon onClick={props.onAddNetworkClick}
                        disabled={props.numVisibleNetworks === props.numNetworks}>
                    <Icon name="plus"/>
                </Button>
            </Button.Group>
        </Menu.Item>
        <Menu.Item>
        </Menu.Item>
        <Menu.Item>
            <Input type="text" label="Streamline fraction" labelPosition="left"
                   value={props.streamlineFraction}/>
            <Slider settings={{
                start: props.streamlineFraction,
                min: 0,
                max: 3,
                step: 0.1,
                onChange: props.onStreamlineFractionChange,
            }}/>
        </Menu.Item>
        <Menu.Item>
            <Input type="text" label="Padding" labelPosition="left" value={props.padding}/>
            <Slider discrete settings={{
                start: props.padding,
                min: 0,
                max: 10,
                step: 1,
                onChange: props.onPaddingChange,
            }}/>
        </Menu.Item>
        <Menu.Item>
            <Input type="text" label="Num modules" labelPosition="left" value={props.numModules}/>
            <Slider discrete settings={{
                start: props.numModules,
                min: 1,
                max: 30,
                step: 1,
                onChange: props.onNumModulesChange,
            }}/>
        </Menu.Item>
        <Menu.Item>
            <Input type="text" label="Streamline threshold" labelPosition="left"
                   value={props.streamlineThreshold}/>
            <Slider settings={{
                start: props.streamlineThreshold,
                min: 0.00000001,
                max: 0.05,
                step: 0.0001,
                onChange: props.onStreamlineThresholdChange,
            }}/>
        </Menu.Item>
    </Sidebar>;
}

MySidebar.propTypes = {
    numVisibleNetworks: PropTypes.number,
    onRemoveNetworkClick: PropTypes.func,
    onAddNetworkClick: PropTypes.func,
    numNetworks: PropTypes.number,
    streamlineFraction: PropTypes.number,
    onStreamlineFractionChange: PropTypes.func,
    padding: PropTypes.number,
    onPaddingChange: PropTypes.func,
    numModules: PropTypes.number,
    onNumModulesChange: PropTypes.func,
    streamlineThreshold: PropTypes.number,
    onStreamlineThresholdChange: PropTypes.func,
};
