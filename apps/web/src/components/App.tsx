import { Box } from "@chakra-ui/react";
import { DiagramView } from "@mapequation/alluvial-diagram";
import { motion } from "framer-motion";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import useEventListener from "../hooks/useEventListener";
import useWindowSize from "../hooks/useWindowSize";
import { StoreContext } from "../store";
import Tooltip from "./Diagram/Tooltip";
import Documentation from "./Documentation";
import LoadNetworks from "./LoadNetworks";
import Logo from "./Logo";
import NodeList from "./NodeList";
import Sidebar from "./Sidebar";
import { useColorModeValue } from "./ui/color-mode";
import { DialogRoot } from "./ui/dialog";

export const drawerWidth = 350;

export default observer(function App() {
  const store = useContext(StoreContext);
  const { width, height } = useWindowSize();
  const bg = useColorModeValue("white", "var(--chakra-colors-gray-900)");
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
    // @ts-ignore
    const key = event?.key;
    if (!store.editMode && key === "l") {
      openLoad();
    }
  });

  return (
    <>
      <DialogRoot
        size="xl"
        placement="center"
        open={isLoadOpen}
        onOpenChange={(e) => !e.open && onLoadClose()}
      >
        <LoadNetworks isOpen={isLoadOpen} onClose={onLoadClose} />
      </DialogRoot>

      <DialogRoot
        size="xl"
        scrollBehavior="inside"
        placement="center"
        open={isHelpOpen}
        onOpenChange={(e) => !e.open && onHelpClose()}
      >
        <Documentation onClose={onHelpClose} />
      </DialogRoot>

      <DialogRoot
        size="xl"
        placement="center"
        open={isExplorerOpen}
        onOpenChange={(e) => !e.open && onExplorerClose()}
      >
        {isExplorerOpen && <NodeList onClose={onExplorerClose} />}
      </DialogRoot>

      <DiagramView
        store={store}
        width={width}
        height={height}
        offsetX={-drawerWidth / 2}
        renderTooltip={({ module, fillColor, children }) => (
          <Tooltip module={module} fillColor={fillColor}>
            {children}
          </Tooltip>
        )}
      />

      <motion.div
        initial={false}
        animate={{ y: isLoadOpen ? 0 : "-100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "6rem",
          zIndex: 1500,
        }}
      >
        <Box px={10} display="flex" alignItems="center" h="6rem" bg={bg}>
          <Logo long />
        </Box>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ x: !isLoadOpen ? 0 : "100%" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: drawerWidth,
          height: "100vh",
        }}
      >
        <Sidebar
          onLoadClick={openLoad}
          onAboutClick={openHelp}
          onModuleViewClick={openExplorer}
        />
      </motion.div>
    </>
  );
});
