import {
  ButtonGroup,
  Flex,
  Kbd,
  ListItem,
  Select,
  Text,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { IoMdColorFill } from "react-icons/io";
import { MdClear } from "react-icons/md";
import { StoreContext } from "../../store";
import { SCHEME_GROUPS, SchemeName } from "../../store/schemes";
import { Swatch } from "./Swatch";
import { Button, Label, ListItemHeader } from "./utils";

interface ColorsProps {
  headerColor: string;
  color: string;
  setColor: (color: string) => void;
}

export default observer(function Colors({
  headerColor,
  color,
  setColor,
}: ColorsProps) {
  const store = useContext(StoreContext);
  const { selectedModule, defaultHighlightColor } = store;

  return (
    <>
      <ListItemHeader color={headerColor}>Colors</ListItemHeader>

      <ListItem>
        <Label>Color scheme</Label>
        <Select
          size="sm"
          w="50%"
          variant="flushed"
          display="inline-block"
          value={store.selectedSchemeName}
          onChange={(event) =>
            store.setSelectedScheme(event.target.value as SchemeName)
          }
          sx={{
            "> optgroup": { color: "gray.900", fontStyle: "normal" },
          }}
        >
          {Array.from(Object.entries(SCHEME_GROUPS)).map(([group, schemes]) => (
            <optgroup label={group} key={group}>
              {schemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>

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
      </ListItem>

      <ListItem>
        <ButtonGroup isAttached w="100%">
          <Button
            onClick={() => store.colorModule(selectedModule!, color)}
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
            onClick={() => store.colorMatchingModules(selectedModule!, color)}
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
            onClick={() => store.colorNodesInModule(selectedModule!, color)}
            isDisabled={store.selectedModule === null}
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
            onClick={() => store.colorModuleIds(selectedModule!, color)}
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
    </>
  );
});