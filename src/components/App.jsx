import { Dialog, DialogContent, DialogTitle, Drawer } from "@mui/material";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { StoreContext } from "../store";
import Diagram from "./Diagram";
import LoadNetworks from "./landing-page/LoadNetworks";
import Sidebar from "./Sidebar";

export default observer(function App() {
  const store = useContext(StoreContext);
  const [isOpen, setIsOpen] = useState(true);

  const drawerWidth = 350;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Load networks</DialogTitle>
        <DialogContent>
          <LoadNetworks
            onSubmit={({ networks }) => {
              store.setNetworks(networks);
              setIsOpen(false);
            }}
          />
        </DialogContent>
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
});
