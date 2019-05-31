import React from "react";
import Header from "./Header";
import LoadNetworks from "./LoadNetworks";
import Documentation from "./Documentation";


export default function StartPage(props) {
  return <React.Fragment>
    <Header/>
    <LoadNetworks {...props}/>
    <Documentation/>
  </React.Fragment>;
}
