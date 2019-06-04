import React, { useState } from "react";
import Documentation from "./Documentation";
import Header from "./Header";
import LoadNetworks from "./LoadNetworks";
import Layout from "./Layout";


export default function App() {
  const [networks, setNetworks] = useState([]);

  if (networks.length === 0) {
    return <React.Fragment>
      <Header/>
      <LoadNetworks onSubmit={setNetworks}/>
      <Documentation/>
    </React.Fragment>;
  }

  return <Layout networks={networks}/>;
}
