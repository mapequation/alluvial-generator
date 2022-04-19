import { Box, Kbd, List, ListItem, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { MdFileUpload, MdHelp } from "react-icons/md";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import { drawerWidth } from "../App";
import Logo from "../Logo";
import Colors from "./Colors";
import Export from "./Export";
import Layout from "./Layout";
import Metadata from "./Metadata";
import Module from "./Module";
import { ListItemButton } from "./utils";

interface SidebarProps {
  onLoadClick: () => void;
  onAboutClick: () => void;
  onModuleViewClick: () => void;
}

export default observer(function Sidebar({
  onLoadClick,
  onAboutClick,
  onModuleViewClick,
}: SidebarProps) {
  const store = useContext(StoreContext);
  const { selectedModule, defaultHighlightColor } = store;
  const bg = useColorModeValue("white", "gray.800");
  const headerColor = useColorModeValue("blue.600", "blue.200");
  const [color, setColor] = useState(defaultHighlightColor);
  console.log("selectedModule", selectedModule);

  useEventListener("keydown", (e) => {
    if (store.editMode) return;

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    // @ts-ignore
    const key = e?.key;

    if (key === "p" && store.selectedModule != null) {
      store.colorModule(store.selectedModule, color);
    } else if (numbers.includes(key)) {
      let index = parseInt(key);
      if (index === 0) index = 10;
      index -= 2;

      if (index === -1) {
        setColor(defaultHighlightColor);
      } else if (index < store.selectedScheme.length - 1) {
        setColor(store.selectedScheme[index]);
      }
    }
  });

  return (
    <Box
      position="fixed"
      bottom="0"
      right="0"
      width={drawerWidth}
      height="100%"
      bg={bg}
      zIndex="1"
      overflowY="scroll"
      boxShadow="2xl"
      p="5"
      pb={10}
    >
      <List spacing={2} fontSize="0.9rem">
        <ListItem mb={5}>
          <Logo showVersion />
        </ListItem>

        <ListItemButton onClick={onLoadClick} leftIcon={<MdFileUpload />}>
          Load or arrange
          <Kbd ml="auto">L</Kbd>
        </ListItemButton>

        <ListItemButton onClick={onAboutClick} leftIcon={<MdHelp />}>
          Help
        </ListItemButton>

        <Colors headerColor={headerColor} color={color} setColor={setColor} />
        <Metadata headerColor={headerColor} />
        <Module
          headerColor={headerColor}
          onModuleViewClick={onModuleViewClick}
        />
        <Layout headerColor={headerColor} />
        <Export headerColor={headerColor} />
      </List>
    </Box>
  );
});
