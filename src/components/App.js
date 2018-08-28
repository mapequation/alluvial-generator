import React from "react";
import { Sidebar } from "semantic-ui-react";

import MySidebar from "./MySidebar";
import AlluvialDiagram from "./AlluvialDiagram";
import parseMap from "../io/parse-map";
import papaParsePromise from "../io/papa-parse-promise";


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

    incrementVisibleNetworksBy = amount => ({ networks, visibleNetworks }) => ({
        visibleNetworks: visibleNetworks.length + amount > networks.length
            ? networks
            : visibleNetworks.length + amount < 1
                ? visibleNetworks
                : networks.slice(0, visibleNetworks.length + amount),
    });

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
            return <Sidebar.Pushable>
                <MySidebar numVisibleNetworks={this.state.visibleNetworks.length} numNetworks={this.state.networks.length}
                           onAddNetworkClick={() => this.setState(this.incrementVisibleNetworksBy(1))}
                           onRemoveNetworkClick={() => this.setState(this.incrementVisibleNetworksBy(-1))}
                           width={this.state.width} onWidthChange={this.handleWidthChange}
                           height={this.state.height} onHeightChange={this.handleHeightChange}
                           padding={this.state.padding} onPaddingChange={padding => this.setState({ padding })}
                           numModules={this.state.numModules}
                           onNumModulesChange={numModules => this.setState({ numModules })}
                           streamlineFraction={this.state.streamlineFraction}
                           onStreamlineFractionChange={streamlineFraction => this.setState({ streamlineFraction })}
                           streamlineThreshold={this.state.streamlineThreshold}
                           onStreamlineThresholdChange={streamlineThreshold => this.setState({ streamlineThreshold })}/>
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
            </Sidebar.Pushable>;
        } else {
            return <div>Loading...</div>;
        }
    }
}
