import React from "react";
import { Sidebar } from "semantic-ui-react";

import MySidebar from "./MySidebar";
import AlluvialDiagram from "./AlluvialDiagram";
import ZoomableSvg from "./ZoomableSvg";
import papaParsePromise from "../io/papa-parse-promise";
import parseFTree from "../io/parse-ftree";
import { pairwise } from "../helpers/pairwise";
import Worker from "worker-loader!../workers/worker.js"; // eslint-disable-line


export default class App extends React.Component {
    state = {
        width: 1200,
        height: 600,
        padding: 3,
        numModules: 15,
        streamlineFraction: 1,
        streamlineThreshold: 0.001,
        parentModule: "root",
        networks: [],
        visibleNetworks: [],
        moduleFlows: [],
    };

    validNumber = (value) => Number.isNaN(+value) ? 0 : +value;

    handleWidthChange = (e, { value }) => this.setState({ width: this.validNumber(value) });
    handleHeightChange = (e, { value }) => this.setState({ height: this.validNumber(value) });

    incrementVisibleNetworksBy = amount => ({ networks, visibleNetworks }) => ({
        visibleNetworks: visibleNetworks.length + amount > networks.length
            ? networks
            : visibleNetworks.length + amount < 1
                ? visibleNetworks
                : networks.slice(0, visibleNetworks.length + amount),
    });

    componentDidMount() {
        const networks = ["science1998_2y.ftree", "science2001_2y.ftree", "science2007_2y.ftree"];

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
                return parsed.map(each => parseFTree(each.data));
            })
            .then(networks => {
                this.setState({ networks, visibleNetworks: networks });

                return Promise.all(pairwise(networks, (left, right) =>
                    new Promise(resolve => {
                        const w = new Worker();
                        w.postMessage({
                            type: "accumulate",
                            sourceNodes: left.data.nodes,
                            targetNodes: right.data.nodes,
                        });
                        w.onmessage = event => resolve(event.data);
                    })));
            })
            .then(moduleFlows => this.setState({ moduleFlows }))
            .catch(console.error);
    }

    render() {
        const { networks, moduleFlows } = this.state;
        const loadingComplete = networks.length && moduleFlows.length;

        return <Sidebar.Pushable>
            <MySidebar numVisibleNetworks={this.state.visibleNetworks.length}
                       numNetworks={this.state.networks.length}
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
                       onStreamlineThresholdChange={streamlineThreshold => this.setState({ streamlineThreshold })}
                       parentModule={this.state.parentModule}
                       onParentModuleChange={(e, { value }) => this.setState({ parentModule: value })}/>
            <Sidebar.Pusher style={{ overflow: "hidden", height: "100vh" }}>
                {loadingComplete &&
                <ZoomableSvg>
                    <AlluvialDiagram networks={this.state.visibleNetworks}
                                     moduleFlows={this.state.moduleFlows}
                                     padding={+this.state.padding}
                                     width={this.state.width}
                                     height={this.state.height}
                                     numModules={+this.state.numModules}
                                     streamlineFraction={+this.state.streamlineFraction}
                                     streamlineThreshold={+this.state.streamlineThreshold}
                                     parentModule={this.state.parentModule}/>
                </ZoomableSvg>
                }
            </Sidebar.Pusher>
        </Sidebar.Pushable>;
    }
}
