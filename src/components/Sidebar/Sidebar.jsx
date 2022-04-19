import {
  Box,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Kbd,
  List,
  ListItem,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { IoMdColorFill } from "react-icons/io";
import {
  MdClear,
  MdFileUpload,
  MdHelp,
  MdOutlineArrowBack,
  MdOutlineArrowDownward,
  MdOutlineArrowForward,
  MdOutlineArrowUpward,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import { SCHEME_GROUPS } from "../../store/schemes";
import { drawerWidth } from "../App";
import Logo from "../Logo";
import Export from "./Export";
import Layout from "./Layout";
import { MetadataView } from "./Metadata";
import { Swatch } from "./Swatch";
import { Button, Label, ListItemButton, ListItemHeader } from "./utils";

export default observer(function Sidebar({
  onLoadClick,
  onAboutClick,
  onModuleViewClick,
}) {
  const store = useContext(StoreContext);
  const { selectedModule, defaultHighlightColor } = store;
  const bg = useColorModeValue("white", "gray.800");
  const headerColor = useColorModeValue("blue.600", "blue.200");
  const [color, setColor] = useState(defaultHighlightColor);
  console.log("selectedModule", selectedModule);

  useEventListener("keydown", (e) => {
    if (store.editMode) return;

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

    if (e?.key === "p" && store.selectedModule != null) {
      store.colorModule(store.selectedModule, color);
    } else if (numbers.includes(e?.key)) {
      let index = parseInt(e?.key);
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

        <ListItemHeader color={headerColor}>Colors</ListItemHeader>

        <ListItem>
          <Label>Color scheme</Label>
          <Select
            size="sm"
            w="50%"
            variant="flushed"
            display="inline-block"
            value={store.selectedSchemeName}
            onChange={(event) => store.setSelectedScheme(event.target.value)}
            sx={{
              "> optgroup": { color: "gray.900", fontStyle: "normal" },
            }}
          >
            {Array.from(Object.entries(SCHEME_GROUPS)).map(
              ([group, schemes]) => (
                <optgroup label={group} key={group}>
                  {schemes.map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {scheme}
                    </option>
                  ))}
                </optgroup>
              )
            )}
          </Select>

          <Flex mt={2} gap={1} wrap="wrap">
            <Swatch
              color={defaultHighlightColor}
              isSelected={color === defaultHighlightColor}
              onClick={() => setColor(defaultHighlightColor)}
            />
            {store.selectedScheme.slice(0, 21).map((schemeColor) => (
              <Swatch
                key={schemeColor}
                color={schemeColor}
                isSelected={color === schemeColor}
                onClick={() => setColor(schemeColor)}
              />
            ))}
          </Flex>
        </ListItem>

        <ListItem>
          <ButtonGroup isAttached w="100%">
            <Button
              onClick={() => store.colorModule(selectedModule, color)}
              isDisabled={store.selectedModule === null}
              justifyContent="center"
              leftIcon={<IoMdColorFill />}
            >
              Paint
              <Kbd ml={8}>P</Kbd>
            </Button>
            <Button
              onClick={() => store.clearColors()}
              leftIcon={<MdClear />}
              justifyContent="center"
              colorScheme="red"
            >
              Clear all
            </Button>
          </ButtonGroup>
        </ListItem>

        <ListItem>
          <Text
            color={headerColor}
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing="tight"
            fontSize="0.75rem"
            pt={2}
          >
            By similarity
          </Text>
          <ButtonGroup isAttached w="100%" mt={1}>
            <Button
              onClick={() => store.colorMatchingModules(selectedModule, color)}
              isDisabled={store.selectedModule === null}
              justifyContent="center"
            >
              Paint modules
            </Button>
            <Button
              onClick={() => {
                store.colorMatchingModulesInAllNetworks();
              }}
              justifyContent="center"
            >
              Paint all
            </Button>
          </ButtonGroup>
        </ListItem>

        <ListItem>
          <Text
            color={headerColor}
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing="tight"
            fontSize="0.75rem"
            pt={2}
          >
            By node assignments
          </Text>
          <ButtonGroup isAttached w="100%" mt={1}>
            <Button
              onClick={() => store.colorNodesInModule(selectedModule, color)}
              isDisabled={store.selectedModule === null}
              justifyContent="center"
            >
              Paint modules
            </Button>
            <Button
              onClick={() => {
                store.colorNodesInModulesInAllNetworks(
                  selectedModule?.networkId
                );
              }}
              justifyContent="center"
            >
              Paint all
            </Button>
          </ButtonGroup>
        </ListItem>

        <ListItem>
          <Text
            color={headerColor}
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing="tight"
            fontSize="0.75rem"
            pt={2}
          >
            By module id
          </Text>
          <ButtonGroup isAttached w="100%" mt={1}>
            <Button
              onClick={() => store.colorModuleIds(selectedModule, color)}
              isDisabled={store.selectedModule === null}
              justifyContent="center"
            >
              Paint modules
            </Button>
            <Button
              onClick={() => {
                store.colorModuleIdsInAllNetworks();
              }}
              justifyContent="center"
            >
              Paint all
            </Button>
          </ButtonGroup>
        </ListItem>

        {store.diagram.children.some((network) => network.isMultilayer) && (
          <ListItem>
            <Text
              color={headerColor}
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="tight"
              fontSize="0.75rem"
              pt={2}
            >
              By layer id
            </Text>
            <ButtonGroup isAttached w="100%" mt={1}>
              <Button
                onClick={() => store.colorByLayer()}
                justifyContent="center"
              >
                Paint all
              </Button>
            </ButtonGroup>
          </ListItem>
        )}

        {store.diagram.children.some((network) => network.isHigherOrder) && (
          <ListItem>
            <Text
              color={headerColor}
              fontWeight={600}
              textTransform="uppercase"
              letterSpacing="tight"
              fontSize="0.75rem"
              pt={2}
            >
              By physical id
            </Text>
            <ButtonGroup isAttached w="100%" mt={1}>
              <Button
                onClick={() => store.colorByPhysicalId()}
                justifyContent="center"
              >
                Paint all
              </Button>
            </ButtonGroup>
          </ListItem>
        )}

        {store.diagram.children.some((network) => network.haveMetadata) && (
          <>
            <ListItemHeader color={headerColor}>Metadata</ListItemHeader>

            <ListItem>
              {selectedModule == null && "Select a module to see metadata"}
              {selectedModule != null &&
                !selectedModule.parent.haveMetadata &&
                "No metadata"}
              {selectedModule != null && selectedModule.parent.haveMetadata && (
                <>
                  <Label>{selectedModule.parent?.name ?? "Network"}</Label>
                  <MetadataView metadata={selectedModule.parent.metadata} />
                </>
              )}
            </ListItem>
          </>
        )}

        <ListItemHeader color={headerColor}>Module</ListItemHeader>

        {selectedModule != null ? (
          <>
            <ListItem>
              <ButtonGroup isAttached w="100%">
                <Button
                  onClick={() => store.moveSelectedModule("up")}
                  isDisabled={store.selectedModule === null}
                  leftIcon={<MdOutlineArrowUpward />}
                >
                  Move up
                  <Kbd ml="auto">W</Kbd>
                </Button>
                <Button
                  onClick={() => store.moveSelectedModule("down")}
                  isDisabled={store.selectedModule === null}
                  leftIcon={<MdOutlineArrowDownward />}
                >
                  Move down
                  <Kbd ml="auto">S</Kbd>
                </Button>
              </ButtonGroup>
            </ListItem>
            <ListItem>
              <ButtonGroup isAttached w="100%">
                <Button
                  onClick={() => store.moveNetwork("left")}
                  isDisabled={store.selectedModule === null}
                  leftIcon={<MdOutlineArrowBack />}
                >
                  Move left
                  <Kbd ml="auto">A</Kbd>
                </Button>
                <Button
                  onClick={() => store.moveNetwork("right")}
                  isDisabled={store.selectedModule === null}
                  leftIcon={<MdOutlineArrowForward />}
                >
                  Move right
                  <Kbd ml="auto">D</Kbd>
                </Button>
              </ButtonGroup>
            </ListItem>
            <ListItem>
              <ButtonGroup isAttached w="100%">
                <Button
                  onClick={() => store.expand(selectedModule)}
                  isDisabled={selectedModule.isLeafModule}
                  leftIcon={<MdUnfoldMore />}
                >
                  Expand
                  <Kbd ml="auto">E</Kbd>
                </Button>
                <Button
                  onClick={() => store.regroup(selectedModule)}
                  isDisabled={selectedModule.isTopModule}
                  leftIcon={<MdUnfoldLess />}
                >
                  Contract
                  <Kbd ml="auto">C</Kbd>
                </Button>
              </ButtonGroup>
            </ListItem>

            <ListItemButton
              onClick={onModuleViewClick}
              leftIcon={<MdFileUpload />}
            >
              Open module
              {/*<Kbd ml="auto">L</Kbd>*/}
            </ListItemButton>

            <ListItem>
              <Label>Network</Label>
              <Editable
                w="50%"
                display="inline-block"
                defaultValue={selectedModule.networkName || "Click to set name"}
                onSubmit={(value) => {
                  store.setNetworkName(selectedModule.networkId, value);
                  store.setEditMode(false);
                }}
                onCancel={() => store.setEditMode(false)}
                onEdit={() => store.setEditMode(true)}
              >
                <EditablePreview />
                <EditableInput />
              </Editable>
            </ListItem>
            <ListItem>
              <Label>Codelength</Label>
              {selectedModule.networkCodelength.toPrecision(3) + " bits"}
            </ListItem>
            <ListItem>
              <Label>Module id</Label>
              {selectedModule.moduleId}
            </ListItem>
            <ListItem>
              <Label>Module name</Label>
              <Editable
                w="50%"
                display="inline-block"
                defaultValue={selectedModule.name || "Click to set name"}
                onSubmit={(value) => {
                  store.setModuleName(selectedModule, value);
                  store.setEditMode(false);
                }}
                onCancel={() => store.setEditMode(false)}
                onEdit={() => store.setEditMode(true)}
              >
                <EditablePreview />
                <EditableInput />
              </Editable>
            </ListItem>
          </>
        ) : (
          <ListItem>No module selected. Click on any module.</ListItem>
        )}

        <Layout color={headerColor} />

        <Export color={headerColor} />
      </List>
    </Box>
  );
});
