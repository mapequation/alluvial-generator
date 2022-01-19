import { useCallback, useContext, useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";
import useEventListener from "../hooks/useEventListener";
import { Modal, Slide } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { StoreContext } from "../store";

export const drawerWidth = 350;

export default observer(function App() {
  const store = useContext(StoreContext);
  const [isLoadOpen, setIsLoadOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const onLoadClose = useCallback(() => setIsLoadOpen(false), [setIsLoadOpen]);

  const onAboutClose = useCallback(
    () => setIsAboutOpen(false),
    [setIsAboutOpen]
  );

  const openLoad = () => {
    setIsLoadOpen(true);
    setIsAboutOpen(false);
  };

  const openAbout = () => {
    setIsAboutOpen(true);
    setIsLoadOpen(false);
  };

  useEventListener("keydown", (event) => {
    if (!store.editMode && event?.key === "l") {
      openLoad();
    }
  });

  return (
    <>
      <Modal size="5xl" isCentered isOpen={isLoadOpen} onClose={onLoadClose}>
        <LoadNetworks isOpen={isLoadOpen} onClose={onLoadClose} />
      </Modal>

      <Modal size="2xl" isOpen={isAboutOpen} onClose={onAboutClose}>
        <Documentation onClose={onAboutClose} />
      </Modal>

      <Diagram />

      <Slide in={!isLoadOpen} style={{ width: drawerWidth }}>
        <Sidebar onLoadClick={openLoad} onAboutClick={openAbout} />
      </Slide>
    </>
  );
});
