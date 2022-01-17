import { useCallback, useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";
import useEventListener from "../hooks/useEventListener";
import { Modal } from "@chakra-ui/react";

export const drawerWidth = 350;

export default function App() {
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
    if (event?.key === "l") {
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

      <Sidebar onLoadClick={openLoad} onAboutClick={openAbout} />
    </>
  );
}
