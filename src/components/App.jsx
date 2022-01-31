import { useContext, useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";
import useEventListener from "../hooks/useEventListener";
import { Box, Modal, Slide, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { StoreContext } from "../store";
import ModuleView from "./ModuleView";
import Logo from "./Sidebar/Logo";

export const drawerWidth = 350;

export default observer(function App() {
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "gray.800");
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

      <Modal
        size="2xl"
        scrollBehavior="inside"
        isOpen={isAboutOpen}
        onClose={onAboutClose}
      >
        <Documentation onClose={onAboutClose} />
      </Modal>

      <Modal size="4xl" isOpen={isModuleViewOpen} onClose={onModuleViewClose}>
        <ModuleView onClose={onModuleViewClose} />
      </Modal>

      <Diagram />

      <Slide
        in={isLoadOpen}
        direction="top"
        style={{ height: "6rem", zIndex: 1500 }}
      >
        <Box
          px={10}
          py={8}
          bg={bg}
          pos="absolute"
          top={0}
          left={0}
          right={0}
          w="100%"
          h="6rem"
          boxShadow="lg"
        >
          <Logo />
        </Box>
      </Slide>

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
