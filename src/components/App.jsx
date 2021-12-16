import { Dialog, Drawer } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";
import Documentation from "./Documentation";

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

  useEffect(() => {
    const onKeyPress = (e) => {
      if (e.key === "l") {
        openLoad();
      }
    };

    document.addEventListener("keydown", onKeyPress);

    return () => document.removeEventListener("keydown", onKeyPress);
  }, [setIsLoadOpen]);

  return (
    <>
      <Dialog open={isLoadOpen} onClose={onLoadClose} maxWidth="lg" fullWidth>
        <LoadNetworks onClose={onLoadClose} />
      </Dialog>
      <Dialog open={isAboutOpen} onClose={onAboutClose} maxWidth="md" fullWidth>
        <Documentation onClose={onAboutClose} />
      </Dialog>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="right"
      >
        <Sidebar onLoadClick={openLoad} onAboutClick={openAbout} />
      </Drawer>
      <Diagram />
    </>
  );
}
