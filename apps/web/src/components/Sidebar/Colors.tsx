import { ButtonGroup, Flex, Kbd, List, Text } from "@chakra-ui/react";
import {
  defaultSchemeOffset,
  schemeIsHueSource,
} from "@mapequation/alluvial-diagram";
import { observer } from "mobx-react";
import { useContext } from "react";
import { IoMdColorFill } from "react-icons/io";
import { MdClear } from "react-icons/md";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import ColorSchemeSelect from "./ColorSchemeSelect";
import { Button, Label, ListItemHeader, Slider } from "./components";
import { SidebarContext } from "./Sidebar";
import Swatch from "./Swatch";
import ToneSelect from "./ToneSelect";

export default observer(function Colors() {
  const store = useContext(StoreContext);
  const { color, setColor, headerColor } = useContext(SidebarContext);
  const { selectedModule, defaultHighlightColor } = store;

  useEventListener("keydown", (e) => {
    if (store.editMode) return;

    const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;

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
    <>
      <ListItemHeader color={headerColor}>Colors</ListItemHeader>

      <List.Item>
        <Label>Color scheme</Label>
        <ColorSchemeSelect />
        <Label>Tone</Label>
        <ToneSelect />
      </List.Item>

      <Slider
        label="Offset"
        value={
          store.selectedOffset ?? defaultSchemeOffset(store.selectedSchemeName)
        }
        min={0}
        max={359}
        step={1}
        onChange={store.setSelectedOffset}
        valueLabelFormat={(value: number) => `${value}°`}
        disabled={!schemeIsHueSource(store.selectedSchemeName)}
      />

      <List.Item>
        <Flex mt={2} gap={1} wrap="wrap">
          <Swatch
            color={defaultHighlightColor}
            isSelected={color === defaultHighlightColor}
            onClick={() => setColor(defaultHighlightColor)}
          >
            1
          </Swatch>
          {store.selectedScheme.slice(0, 21).map((schemeColor, i) => (
            <Swatch
              key={`${i}-${schemeColor}`}
              color={schemeColor}
              isSelected={color === schemeColor}
              onClick={() => setColor(schemeColor)}
            >
              {i < 9 && (i + 2) % 10}
            </Swatch>
          ))}
        </Flex>
      </List.Item>

      <List.Item>
        <ButtonGroup attached w="100%">
          <Button
            onClick={() => store.colorModule(selectedModule!, color)}
            disabled={store.selectedModule === null}
            justifyContent="center"
          >
            <IoMdColorFill />
            Paint
            <Kbd ml={8}>P</Kbd>
          </Button>
          <Button
            onClick={() => store.clearColors()}
            justifyContent="center"
            colorPalette="red"
          >
            <MdClear />
            Clear all
          </Button>
        </ButtonGroup>
      </List.Item>

      <List.Item>
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
        <ButtonGroup attached w="100%" mt={1}>
          <Button
            onClick={() => store.colorMatchingModules(selectedModule!, color)}
            disabled={store.selectedModule === null}
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
      </List.Item>

      <List.Item>
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
        <ButtonGroup attached w="100%" mt={1}>
          <Button
            onClick={() => store.colorNodesInModule(selectedModule!, color)}
            disabled={store.selectedModule === null}
            justifyContent="center"
          >
            Paint modules
          </Button>
          <Button
            onClick={() => {
              store.colorNodesInModulesInAllNetworks(selectedModule?.networkId);
            }}
            justifyContent="center"
          >
            Paint all
          </Button>
        </ButtonGroup>
      </List.Item>

      <List.Item>
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
        <ButtonGroup attached w="100%" mt={1}>
          <Button
            onClick={() => store.colorModuleIds(selectedModule!, color)}
            disabled={store.selectedModule === null}
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
      </List.Item>

      <List.Item>
        <Text
          color={headerColor}
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing="tight"
          fontSize="0.75rem"
          pt={2}
        >
          By module hierarchy
        </Text>
        <ButtonGroup attached w="100%" mt={1}>
          <Button
            onClick={() => store.colorModuleHierarchyInAllNetworks()}
            justifyContent="center"
          >
            Paint all
          </Button>
        </ButtonGroup>
      </List.Item>

      {store.diagram.children.some((network) => network.isMultilayer) && (
        <List.Item>
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
          <ButtonGroup attached w="100%" mt={1}>
            <Button
              onClick={() => store.colorByLayer()}
              justifyContent="center"
            >
              Paint all
            </Button>
          </ButtonGroup>
        </List.Item>
      )}

      {store.diagram.children.some((network) => network.isHigherOrder) && (
        <List.Item>
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
          <ButtonGroup attached w="100%" mt={1}>
            <Button
              onClick={() => store.colorByPhysicalId()}
              justifyContent="center"
            >
              Paint all
            </Button>
          </ButtonGroup>
        </List.Item>
      )}
    </>
  );
});
