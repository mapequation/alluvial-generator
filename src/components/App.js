import React, { useState } from "react";
import Documentation from "./Documentation";
import Header from "./Header";
import LoadNetworks from "./LoadNetworks";
import Layout from "./Layout";


export default function App() {
  const [state, setState] = useState({ networks: [] });

  if (state.networks.length === 0) {
    return <React.Fragment>
      <Header/>
      <LoadNetworks onSubmit={setState}/>
      <Documentation/>
    </React.Fragment>;
  }

  return <Layout {...state}/>;
}
