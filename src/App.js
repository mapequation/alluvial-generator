import React from "react";
import { Sidebar, Menu, Input } from "semantic-ui-react";
import { Slider } from "react-semantic-ui-range";

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

    handleWidthChange = (e, { value }) => this.setState({ width: value });
    handleHeightChange = (e, { value }) => this.setState({ height: value });

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
