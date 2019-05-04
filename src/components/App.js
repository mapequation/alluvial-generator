import React from "react";

import FileLoadingScreen from "./FileLoadingScreen";
import Header from "./Header";
import Sidebar from "./Sidebar";


export default class App extends React.Component {
  state = {
    networks: []
  };

  render() {
    const { networks } = this.state;

    const loadingComplete = networks.length > 0;

    return loadingComplete ? (
      <Sidebar networks={networks} />
    ) : (
      <React.Fragment>
        <Header />
        <FileLoadingScreen onSubmit={networks => this.setState({ networks })} />
      </React.Fragment>
    );
  }
}
