import { observer } from "mobx-react";
import { StrictMode, useContext } from "react";
import { StoreContext } from "../store";
import Diagram from "./Diagram";
import Documentation from "./landing-page/Documentation";
import Header from "./landing-page/Header";
import LoadNetworks from "./landing-page/LoadNetworks";
import Sidebar from "./Sidebar";

export default observer(function App() {
  const store = useContext(StoreContext);

  if (store.networks.length === 0) {
    return (
      <>
        <Header />
        <LoadNetworks
          onSubmit={({ networks }) => store.setNetworks(networks)}
        />
        <Documentation />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <StrictMode>
        <Diagram />
      </StrictMode>
    </>
  );
});
