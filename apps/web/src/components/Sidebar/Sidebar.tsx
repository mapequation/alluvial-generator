import { Box, HStack, Kbd, List, Text } from "@chakra-ui/react";
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
import { SiGithub, SiNpm, SiPypi } from "react-icons/si";
import { StoreContext } from "../../store";
import Logo from "../Logo";
import { useColorModeValue } from "../ui/color-mode";
import Cite, { CiteIcon } from "./Cite";
import Colors from "./Colors";
import { Button, ListItemButton } from "./components";
import Export from "./Export";
import Layout from "./Layout";
import Metadata from "./Metadata";
import Module from "./Module";

const links = [
  {
    label: "GitHub",
    href: "https://github.com/mapequation/alluvial",
    Icon: SiGithub,
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/@mapequation/alluvial-diagram",
    Icon: SiNpm,
  },
  { label: "PyPI", href: "https://pypi.org/project/alluvial/", Icon: SiPypi },
];

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
  const bg = useColorModeValue("white", "gray.900");
  const headerColor = useColorModeValue("blue.600", "blue.200");
  const [color, setColor] = useState(defaultHighlightColor);

  return (
    <Box
      width="100%"
      height="100%"
      bg={bg}
      zIndex="1"
      overflowY="auto"
      boxShadow="2xl"
      p="5"
      pb={10}
    >
      <List.Root
        gap={2}
        fontSize="0.9rem"
        listStyleType="none"
        ml={0}
        pl={0}
      >
        <List.Item mb={5}>
          <Logo showVersion />
          <Text ml="3.6em" mt={-1} fontSize="xs">
            Powered by Infomap v{Infomap.__version__}
          </Text>
        </List.Item>

        <List.Item>
          <HStack gap={2}>
            {links.map(({ label, href, Icon }) => (
              <Button key={label} asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  // index.css colours every link; match the other buttons.
                  style={{ color: "var(--chakra-colors-color-palette-fg)" }}
                >
                  <Icon />
                  {label}
                </a>
              </Button>
            ))}
          </HStack>
        </List.Item>

        <ListItemButton onClick={onLoadClick}>
          <MdFileUpload />
          Load or arrange
          <Kbd ml="auto">L</Kbd>
        </ListItemButton>

        <List.Item>
          <Cite>
            <Button>
              <CiteIcon />
              How to cite
            </Button>
          </Cite>
        </List.Item>

        <ListItemButton onClick={onAboutClick}>
          <MdHelp />
          Help
        </ListItemButton>

        <SidebarContext.Provider value={{ color, setColor, headerColor }}>
          <Colors />
          <Metadata />
          <Module onModuleViewClick={onModuleViewClick} />
          <Layout />
          <Export />
        </SidebarContext.Provider>
      </List.Root>
    </Box>
  );
});
