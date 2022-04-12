import {
  Box,
  Button as CkButton,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  HStack,
  Kbd,
  List,
  ListItem,
  Radio,
  RadioGroup as CkRadioGroup,
  Select,
  Slider as CkSlider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch as CkSwitch,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { IoMdColorFill } from "react-icons/io";
import {
  MdClear,
  MdFileDownload,
  MdFileUpload,
  MdHelp,
  MdOutlineArrowBack,
  MdOutlineArrowDownward,
  MdOutlineArrowForward,
  MdOutlineArrowUpward,
  MdRestartAlt,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";
import useEventListener from "../../hooks/useEventListener";
import { saveSvg } from "../../io/export";
import { StoreContext } from "../../store";
import { SCHEME_NAMES } from "../../store/schemes";
import { drawerWidth } from "../App";
import Logo from "../Logo";
import { Swatch } from "./Swatch";

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

  const downloadSvg = () => {
    store.setSelectedModule(null);
    const svg = document.getElementById("alluvialSvg");
    const filename =
      store.diagram.children.map((n) => n.name).join("-") + ".svg";

    setTimeout(() => saveSvg(svg, filename), 500);
  };

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
          >
            {SCHEME_NAMES.map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme}
              </option>
            ))}
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

        <ListItemHeader color={headerColor}>Layout</ListItemHeader>

        <ListItemButton
          onClick={() => store.resetLayout()}
          leftIcon={<MdRestartAlt />}
        >
          Sort modules
        </ListItemButton>

        <Slider
          label="Height"
          value={store.height}
          min={400}
          max={2000}
          step={10}
          onChange={store.setHeight}
        />
        <Slider
          label="Module width"
          value={store.moduleWidth}
          min={10}
          max={200}
          step={10}
          onChange={store.setModuleWidth}
        />
        <Slider
          label="Streamline width"
          value={store.streamlineFraction}
          min={0}
          max={10}
          step={0.1}
          valueLabelFormat={(value) => Math.round(value * 100) + "%"}
          onChange={store.setStreamlineFraction}
        />
        <Slider
          label="Module top margin"
          value={store.marginExponent}
          min={1}
          max={6}
          valueLabelFormat={(value) => 2 ** (value - 1)}
          onChange={store.setMarginExponent}
        />
        <Slider
          label="Visible flow"
          value={(1 - store.flowThreshold) * 100}
          min={95}
          max={100}
          step={0.1}
          valueLabelFormat={(value) => value + "%"}
          onChange={(value) => store.setFlowThreshold(1 - value / 100)}
        />
        <Slider
          label="Streamline filter"
          value={store.streamlineThreshold}
          min={0}
          max={5}
          step={0.01}
          onChange={store.setStreamlineThreshold}
        />
        <Slider
          label="Transparency"
          value={1 - store.streamlineOpacity}
          min={0}
          max={1}
          step={0.01}
          valueLabelFormat={(value) => Math.round((1 - value) * 100) + "%"}
          onChange={(value) => store.setStreamlineOpacity(1 - value)}
        />
        <Slider
          label="Module font size"
          value={store.fontSize}
          min={2}
          max={20}
          onChange={store.setFontSize}
        />
        <Slider
          label="Network font size"
          value={store.networkFontSize}
          min={5}
          max={40}
          onChange={store.setNetworkFontSize}
        />

        <RadioGroup
          legend="Hierarchical modules"
          value={store.hierarchicalModules}
          onChange={store.setHierarchicalModules}
          options={["none", "shadow", "outline"]}
        />

        <RadioGroup
          legend="Module size"
          value={store.moduleSize}
          onChange={store.setModuleSize}
          options={["flow", "nodes"]}
        />

        <RadioGroup
          legend="Module order"
          value={store.sortModulesBy}
          onChange={store.setSortModulesBy}
          options={["flow", "nodes"]}
        />

        <Switch
          label="Bottom align"
          isChecked={store.verticalAlign === "bottom"}
          onChange={(value) =>
            store.setVerticalAlign(value ? "bottom" : "justify")
          }
        />
        <Switch
          label="Module ids"
          isChecked={store.showModuleId}
          onChange={store.setShowModuleId}
        />
        <Switch
          label="Module names"
          isChecked={store.showModuleNames}
          onChange={store.setShowModuleNames}
        />
        {store.diagram.children.some((network) => network.isHigherOrder) && (
          <Switch
            label="Aggregate states names"
            isChecked={store.aggregateStateNames}
            onChange={store.setAggregateStateNames}
          />
        )}
        <Switch
          label="Network names"
          isChecked={store.showNetworkNames}
          onChange={store.setShowNetworkNames}
        />
        <Switch
          label="Adaptive font size"
          isChecked={store.adaptiveFontSize}
          onChange={store.setAdaptiveFontSize}
        />
        <Switch
          label="Drop shadow"
          isChecked={store.dropShadow}
          onChange={store.setDropShadow}
        />

        <ListItemHeader color={headerColor}>Export</ListItemHeader>

        <ListItemButton
          onClick={downloadSvg}
          variant="link"
          leftIcon={<MdFileDownload />}
        >
          Download SVG
        </ListItemButton>
      </List>
    </Box>
  );
});

function Button(props) {
  return (
    <CkButton
      isFullWidth
      variant="outline"
      size="sm"
      justifyContent="flex-start"
      fontWeight={500}
      {...props}
    />
  );
}

function ListItemButton(props) {
  return (
    <ListItem>
      <Button {...props} />
    </ListItem>
  );
}

function ListItemHeader(props) {
  return (
    <ListItem
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="tight"
      fontSize="0.8rem"
      pt={6}
      {...props}
    />
  );
}

function Label({ children, ...props }) {
  return (
    <span style={{ display: "inline-block", width: "50%" }} {...props}>
      {children}
    </span>
  );
}

function Slider({ label, value, onChange, valueLabelFormat, ...props }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setCurrentValue(value), [value, setCurrentValue]);

  return (
    <ListItem>
      <Label>{label}</Label>
      <CkSlider
        defaultValue={value}
        value={currentValue}
        w="50%"
        size="sm"
        onChange={setCurrentValue}
        onChangeEnd={onChange}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        {...props}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          placement="top"
          bg="blue.600"
          isOpen={isOpen}
          label={
            valueLabelFormat != null
              ? valueLabelFormat(currentValue)
              : currentValue
          }
        >
          <SliderThumb />
        </Tooltip>
      </CkSlider>
    </ListItem>
  );
}

function RadioGroup({ legend, value, onChange, options }) {
  return (
    <ListItem>
      <HStack>
        <Label>{legend}</Label>
        <CkRadioGroup value={value} onChange={onChange} size="sm">
          <HStack>
            {options.map((value) => (
              <Radio value={value} key={value}>
                {value}
              </Radio>
            ))}
          </HStack>
        </CkRadioGroup>
      </HStack>
    </ListItem>
  );
}

function Switch({ onChange, label, ...props }) {
  return (
    <ListItem>
      <Label>{label}</Label>
      <CkSwitch
        size="sm"
        onChange={(event) => onChange(event.target.checked)}
        {...props}
      />
    </ListItem>
  );
}
