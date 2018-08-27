import React from "react";
import { Button, Icon, Input, Menu, Sidebar } from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";

import parseMap from "../io/parse-map";
import papaParsePromise from "../io/papa-parse-promise";
import AlluvialDiagram from "./AlluvialDiagram";


export default class App extends React.Component {
    state = {
        width: 1200,
        height: 600,
        padding: 3,
        numModules: 15,
        streamlineFraction: 1,
        streamlineThreshold: 0.001,
        networks: null,
        visibleNetworks: null,
    };

    handleWidthChange = (e, { value }) => this.setState({ width: value });
    handleHeightChange = (e, { value }) => this.setState({ height: value });

    incrementVisibleNetworksBy = amount => () => this.setState(({ networks, visibleNetworks }) => ({
        visibleNetworks: visibleNetworks.length + amount > networks.length
            ? networks
            : visibleNetworks.length + amount < 1
                ? visibleNetworks
                : networks.slice(0, visibleNetworks.length + amount)
    }));

    addNetwork = this.incrementVisibleNetworksBy(1);
    removeNetwork = this.incrementVisibleNetworksBy(-1);

    componentDidMount() {
        const networks = ["science1998_2y.map", "science2001_2y.map", "science2004_2y.map"];

        const parseOpts = {
            comments: "#",
            delimiter: " ",
            quoteChar: "\"",
            dynamicTyping: true,
            skipEmptyLines: true,
            worker: true,
        };

        Promise.all(networks.map(network => fetch(`/data/${network}`)))
            .then(responses => Promise.all(responses.map(response => response.text())))
            .then(files => Promise.all(files.map(file => papaParsePromise(file, parseOpts))))
            .then(parsed => {
                parsed.map(_ => _.errors).forEach(_ => _.forEach(err => {
                    throw err;
                }));
                return parsed.map(each => parseMap(each.data));
            })
            .then(networks => this.setState({ networks, visibleNetworks: networks }))
            .catch(console.error);
    }

    render() {
        const { networks } = this.state;

        if (networks) {
            return (
                <Sidebar.Pushable>
                    <Sidebar
                        as={Menu}
                        animation="overlay"
                        width="wide"
                        direction="right"
                        visible={true}
                        vertical
                    >
                        <Menu.Item>
                            <Button>Visible networks {this.state.visibleNetworks.length}</Button>
                            <Button.Group>
                                <Button icon onClick={this.removeNetwork}
                                        disabled={this.state.visibleNetworks.length === 1}>
                                    <Icon name="minus"/>
                                </Button>
                                <Button icon onClick={this.addNetwork}
                                        disabled={this.state.visibleNetworks.length === this.state.networks.length}>
                                    <Icon name="plus"/>
                                </Button>
                            </Button.Group>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Width" labelPosition="left" value={this.state.width}
                                   onChange={this.handleWidthChange}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Height" labelPosition="left" value={this.state.height}
                                   onChange={this.handleHeightChange}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Streamline fraction" labelPosition="left"
                                   value={this.state.streamlineFraction}/>
                            <Slider settings={{
                                start: this.state.streamlineFraction,
                                min: 0,
                                max: 3,
                                step: 0.1,
                                onChange: streamlineFraction => this.setState({ streamlineFraction }),
                            }}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Padding" labelPosition="left" value={this.state.padding}/>
                            <Slider discrete settings={{
                                start: this.state.padding,
                                min: 0,
                                max: 10,
                                step: 1,
                                onChange: padding => this.setState({ padding }),
                            }}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Num modules" labelPosition="left" value={this.state.numModules}/>
                            <Slider discrete settings={{
                                start: this.state.numModules,
                                min: 1,
                                max: 30,
                                step: 1,
                                onChange: numModules => this.setState({ numModules }),
                            }}/>
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Streamline threshold" labelPosition="left"
                                   value={this.state.streamlineThreshold}/>
                            <Slider settings={{
                                start: this.state.streamlineThreshold,
                                min: 0.00000001,
                                max: 0.05,
                                step: 0.0001,
                                onChange: streamlineThreshold => this.setState({ streamlineThreshold }),
                            }}/>
                        </Menu.Item>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <AlluvialDiagram
                            networks={this.state.visibleNetworks}
                            width={+this.state.width}
                            height={+this.state.height}
                            padding={+this.state.padding}
                            numModules={+this.state.numModules}
                            streamlineFraction={+this.state.streamlineFraction}
                            streamlineThreshold={+this.state.streamlineThreshold}
                        />
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            );
        } else {
            return <div>Loading...</div>;
        }
    }
}
