import React, { useState } from "react";
import Sidebar from "./Sidebar";
import StartPage from "./StartPage";


export default function App() {
  const [networks, setNetworks] = useState([]);

  if (networks.length === 0) {
    return <StartPage onSubmit={setNetworks}/>;
  }

  return <Sidebar networks={networks}/>;
}
