import React from "react";
import { Sidebar } from "semantic-ui-react";

import papaParsePromise from "../io/papa-parse-promise";
import parseFTree from "../io/parse-ftree";
import AlluvialDiagram from "./AlluvialDiagram";

import MySidebar from "./Sidebar";
import ZoomableSvg from "./ZoomableSvg";

export default class App extends React.Component {
  state = {
    width: 1200,
    height: 600,
    duration: 500,
    streamlineFraction: 2,
    networks: [],
    visibleNetworks: []
  };

  validNumber = value => (Number.isNaN(+value) ? 0 : +value);

  handleWidthChange = (e, { value }) =>
    this.setState({ width: this.validNumber(value) });
  handleHeightChange = (e, { value }) =>
    this.setState({ height: this.validNumber(value) });

  incrementVisibleNetworksBy = amount => ({ networks, visibleNetworks }) => ({
    visibleNetworks:
      visibleNetworks.length + amount > networks.length
        ? networks
        : visibleNetworks.length + amount < 0
          ? visibleNetworks
          : networks.slice(0, visibleNetworks.length + amount)
  });

  componentDidMount() {
    const networks = [
      "science1998_2y.ftree",
      "science2001_2y.ftree",
      "science2007_2y.ftree"
    ];

    const parseOpts = {
      comments: "#",
      delimiter: " ",
      quoteChar: '"',
      dynamicTyping: false,
      skipEmptyLines: true,
      worker: true
    };

    Promise.all(networks.map(network => fetch(`/data/${network}`)))
      .then(responses =>
        Promise.all(responses.map(response => response.text()))
      )
      .then(files =>
        Promise.all(files.map(file => papaParsePromise(file, parseOpts)))
      )
      .then(parsed => {
        parsed.map(_ => _.errors).forEach(_ =>
          _.forEach(err => {
            throw err;
          })
        );
        return parsed.map(each => parseFTree(each.data));
      })
      .then(networks => this.setState({ networks, visibleNetworks: networks }))
      .catch(console.error);
  }

  render() {
    const { networks } = this.state;
    const loadingComplete = networks.length > 0;

    return (
      <Sidebar.Pushable>
        <MySidebar
          numVisibleNetworks={this.state.visibleNetworks.length}
          numNetworks={this.state.networks.length}
          onAddNetworkClick={() =>
            this.setState(this.incrementVisibleNetworksBy(1))
          }
          onRemoveNetworkClick={() =>
            this.setState(this.incrementVisibleNetworksBy(-1))
          }
          width={this.state.width}
          onWidthChange={this.handleWidthChange}
          height={this.state.height}
          onHeightChange={this.handleHeightChange}
          streamlineFraction={this.state.streamlineFraction}
          onStreamlineFractionChange={streamlineFraction =>
            this.setState({ streamlineFraction })
          }
          duration={this.state.duration}
          onDurationChange={duration => this.setState({ duration })}
        />
        <Sidebar.Pusher style={{ overflow: "hidden", height: "100vh" }}>
          {loadingComplete && (
            <ZoomableSvg>
              <AlluvialDiagram
                networks={this.state.visibleNetworks}
                width={this.state.width}
                height={this.state.height}
                streamlineFraction={+this.state.streamlineFraction}
                duration={+this.state.duration}
              />
            </ZoomableSvg>
          )}
          {!loadingComplete && <div>Loading...</div>}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
