import { Box, Kbd, List, ListItem, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { MdFileUpload, MdHelp } from "react-icons/md";
import { StoreContext } from "../../store";
import { drawerWidth } from "../App";
import Logo from "../Logo";
import Colors from "./Colors";
import { ListItemButton } from "./Components";
import Export from "./Export";
import Layout from "./Layout";
import Metadata from "./Metadata";
import Module from "./Module";

export default observer(function Sidebar({
  onLoadClick,
  onAboutClick,
  onModuleViewClick,
}: {
  onLoadClick: () => void;
  onAboutClick: () => void;
  onModuleViewClick: () => void;
}) {
  const store = useContext(StoreContext);
  const { defaultHighlightColor } = store;
  const bg = useColorModeValue("white", "gray.800");
  const headerColor = useColorModeValue("blue.600", "blue.200");
  const [color, setColor] = useState(defaultHighlightColor);

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
        <Metadata headerColor={headerColor} color={color} />
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
