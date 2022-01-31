import { useContext, useState } from "react";
import { observer } from "mobx-react";
import { Box, Modal, Slide, useColorModeValue } from "@chakra-ui/react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";
import Explorer from "./Explorer";
import Logo from "./Logo";
import useEventListener from "../hooks/useEventListener";
import { StoreContext } from "../store";

export const drawerWidth = 350;

export default observer(function App() {
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "var(--chakra-colors-gray-800)");
  const [isLoadOpen, setIsLoadOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const onLoadClose = () => setIsLoadOpen(false);
  const onHelpClose = () => setIsHelpOpen(false);
  const onExplorerClose = () => setIsExplorerOpen(false);

  const openLoad = () => {
    setIsLoadOpen(true);
    onHelpClose();
    onExplorerClose();
  };

  const openHelp = () => {
    setIsHelpOpen(true);
    onLoadClose();
    onExplorerClose();
  };

  const openExplorer = () => {
    setIsExplorerOpen(true);
    onLoadClose();
    onHelpClose();
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
        isOpen={isHelpOpen}
        onClose={onHelpClose}
      >
        <Documentation onClose={onHelpClose} />
      </Modal>

      <Modal size="4xl" isOpen={isExplorerOpen} onClose={onExplorerClose}>
        <Explorer onClose={onExplorerClose} />
      </Modal>

      <Diagram />

      <Slide
        in={isLoadOpen}
        direction="top"
        style={{ height: "6rem", zIndex: 1500 }}
      >
        <Box px={10} display="flex" alignItems="center" h="6rem" bg={bg}>
          <Logo />
        </Box>
      </Slide>

      <Slide in={!isLoadOpen} style={{ width: drawerWidth }}>
        <Sidebar
          in={!isLoadOpen}
          onLoadClick={openLoad}
          onAboutClick={openHelp}
          onModuleViewClick={openExplorer}
        />
      </Slide>
    </>
  );
});
