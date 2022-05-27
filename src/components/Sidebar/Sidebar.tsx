import {
  Box,
  Kbd,
  List,
  ListItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Infomap from "@mapequation/infomap";
import { observer } from "mobx-react";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { MdFileUpload, MdHelp } from "react-icons/md";
import { StoreContext } from "../../store";
import { drawerWidth } from "../App";
import Logo from "../Logo";
import Colors from "./Colors";
import { ListItemButton } from "./components";
import Export from "./Export";
import Layout from "./Layout";
import Metadata from "./Metadata";
import Module from "./Module";

export const SidebarContext = createContext<{
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  headerColor: string;
}>({
  color: "white",
  setColor: () => {},
  headerColor: "blue.600",
});

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
          <Text ml="3.6em" mt={-1} fontSize="xs">
            Powered by Infomap v{Infomap.__version__}
          </Text>
        </ListItem>

        <ListItemButton onClick={onLoadClick} leftIcon={<MdFileUpload />}>
          Load or arrange
          <Kbd ml="auto">L</Kbd>
        </ListItemButton>

        <ListItemButton onClick={onAboutClick} leftIcon={<MdHelp />}>
          Help
        </ListItemButton>

        <SidebarContext.Provider value={{ color, setColor, headerColor }}>
          <Colors />
          <Metadata />
          <Module onModuleViewClick={onModuleViewClick} />
          <Layout />
          <Export />
        </SidebarContext.Provider>
      </List>
    </Box>
  );
});
