import React from "react";
import { Sidebar, Menu, Input } from "semantic-ui-react";

import { parseMap } from "./parse-map";
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
    };

    handleWidthChange = (e, {value}) => this.setState({ width: value});
    handleHeightChange = (e, {value}) => this.setState({ height: value});
    handlePaddingChange = (e, {value}) => this.setState({ padding: value});
    handleStreamlineFractionChange = (e, {value}) => this.setState({ streamlineFraction: value});
    handleNumModulesChange = (e, {value}) => this.setState({ numModules: value});
    handleStreamlineThresholdChange = (e, {value}) => this.setState({ streamlineThreshold: value});

    componentDidMount() {
        const networks = ["/science1998_2y.map", "/science2001_2y.map", "/science2004_2y.map"];

        const parseOpts = {
            comments: "#",
            delimiter: " ",
            quoteChar: "\"",
            dynamicTyping: true,
            skipEmptyLines: true,
            worker: true,
        };

        Promise.all(networks.map(f => fetch(f)))
            .then(responses =>
                Promise.all(responses.map(res => res.text()))
                    .then(files =>
                        Promise.all(files.map(file => new Promise((complete, error) =>
                            Papa.parse(file, Object.assign(parseOpts, { complete, error }))))))) // eslint-disable-line no-undef
            .then(parsed => {
                parsed.map(_ => _.errors).forEach(_ => _.forEach(err => {
                    throw err;
                }));
                return parsed.map(each => parseMap(each.data));
            })
            .then(networks => this.setState({ networks }))
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
                            <Input type="text" label="Width" labelPosition="left" value={this.state.width}
                                   onChange={this.handleWidthChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Height" labelPosition="left" value={this.state.height}
                                   onChange={this.handleHeightChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Streamline fraction" labelPosition="left" value={this.state.streamlineFraction}
                                   onChange={this.handleStreamlineFractionChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Padding" labelPosition="left" value={this.state.padding}
                                   onChange={this.handlePaddingChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Num modules" labelPosition="left" value={this.state.numModules}
                                   onChange={this.handleNumModulesChange} />
                        </Menu.Item>
                        <Menu.Item>
                            <Input type="text" label="Streamline threshold" labelPosition="left" value={this.state.streamlineThreshold}
                                   onChange={this.handleStreamlineThresholdChange} />
                        </Menu.Item>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <AlluvialDiagram
                            networks={this.state.networks}
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
