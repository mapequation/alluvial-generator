import { Dialog, Drawer } from "@mui/material";
import { useState } from "react";
import Diagram from "./Diagram";
import LoadNetworks from "./LoadNetworks";
import Sidebar from "./Sidebar";

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  const drawerWidth = 350;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <LoadNetworks onClose={() => setIsOpen(false)} />
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
        <Sidebar onClick={() => setIsOpen(true)} />
      </Drawer>
      <Diagram />
    </>
  );
}
