import { useContext, useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";
import useEventListener from "../hooks/useEventListener";
import { Modal, Slide } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { StoreContext } from "../store";
import ModuleView from "./ModuleView";

export const drawerWidth = 350;

export default observer(function App() {
  const store = useContext(StoreContext);
  const [isLoadOpen, setIsLoadOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isModuleViewOpen, setIsModuleViewOpen] = useState(false);

  const onLoadClose = () => setIsLoadOpen(false);
  const onAboutClose = () => setIsAboutOpen(false);
  const onModuleViewClose = () => setIsModuleViewOpen(false);

  const openLoad = () => {
    setIsLoadOpen(true);
    setIsAboutOpen(false);
    setIsModuleViewOpen(false);
  };

  const openAbout = () => {
    setIsAboutOpen(true);
    setIsLoadOpen(false);
    setIsModuleViewOpen(false);
  };

  const openModuleView = () => {
    setIsModuleViewOpen(true);
    setIsLoadOpen(false);
    setIsAboutOpen(false);
  };

  useEventListener("keydown", (event) => {
    if (!store.editMode && event?.key === "l") {
      openLoad();
    }
  });

  return (
    <>
      <Modal size="5xl" isCentered isOpen={isLoadOpen} onClose={onLoadClose}>
        <LoadNetworks onClose={onLoadClose} />
      </Modal>

      <Modal size="2xl" isOpen={isAboutOpen} onClose={onAboutClose}>
        <Documentation onClose={onAboutClose} />
      </Modal>

      <Modal size="4xl" isOpen={isModuleViewOpen} onClose={onModuleViewClose}>
        <ModuleView onClose={onModuleViewClose} />
      </Modal>

      <Diagram />

      <Slide in={!isLoadOpen} style={{ width: drawerWidth }}>
        <Sidebar
          onLoadClick={openLoad}
          onAboutClick={openAbout}
          onModuleViewClick={openModuleView}
        />
      </Slide>
    </>
  );
});
