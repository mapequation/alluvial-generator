import React from "react";
import Documentation from "./Documentation";
import Header from "./Header";
import LoadNetworks from "./LoadNetworks";


export default function StartPage(props) {
  return <React.Fragment>
    <Header/>
    <LoadNetworks {...props}/>
    <Documentation/>
  </React.Fragment>;
}
