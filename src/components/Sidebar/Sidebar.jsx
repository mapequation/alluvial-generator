import {
  Box,
  Button as CkButton,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  HStack,
  IconButton,
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
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
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
import { IoMdColorFill } from "react-icons/io";
import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { SCHEME_NAMES, StoreContext } from "../../store";
import { drawerWidth } from "../App";
import useEventListener from "../../hooks/useEventListener";
import { saveSvg } from "../../io/export";
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

  const leafNodes = selectedModule ? selectedModule.getLeafNodes() : [];

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
        <ListItem>
          <Logo />
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
            <ListItem>
              <Label>Codelength</Label>
              {selectedModule.networkCodelength.toPrecision(3) + " bits"}
            </ListItem>
            <ListItem>
              <Label>Module id</Label>
              {selectedModule.moduleId}
            </ListItem>
            <ListItem>
              <Label>Level</Label>
              {selectedModule.moduleLevel}
            </ListItem>
            <ListItem>
              <Label>Flow</Label>
              {selectedModule.flow.toPrecision(3)}
            </ListItem>
            <ListItem>
              <Label>Nodes</Label>
              {leafNodes.length}
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
        <Switch
          label="Network names"
          isChecked={store.showNetworkNames}
          onChange={store.setShowNetworkNames}
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

  return (
    <ListItem>
      <Label>{label}</Label>
      <CkSlider
        defaultValue={value}
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

function Logo() {
  const { toggleColorMode } = useColorMode();
  const color = useColorModeValue("hsl(0, 0%, 33%)", "hsl(0, 0%, 60%)");
  const brand = useColorModeValue("hsl(0, 68%, 42%)", "hsl(0, 68%, 62%)");
  const version = useColorModeValue("hsl(0, 0%, 70%)", "hsl(0, 0%, 30%)");

  const styles = {
    base: {
      fontFamily: "Philosopher, serif",
      fontWeight: 700,
      fontSize: "1.4em",
    },
    infomap: {
      color,
    },
    alluvial: {
      color: brand,
    },
    version: {
      color: version,
    },
  };

  return (
    <HStack w="100%" justify="space-between" align="center" pb={3}>
      <HStack justify="flex-start" align="center" spacing={3}>
        <a href="//mapequation.org">
          <img
            alt="MapEquation"
            width="32px"
            height="32px"
            src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
          />
        </a>
        <div>
          <span style={styles.base}>
            <span style={styles.infomap}>Alluvial</span>{" "}
            <span style={styles.alluvial}>Generator</span>
          </span>
          <span style={styles.version}>
            {" v" + process.env.REACT_APP_VERSION}
          </span>
        </div>
      </HStack>
      <IconButton
        size="xs"
        variant="ghost"
        aria-label="color mode"
        onClick={toggleColorMode}
      >
        <SunOrMoon />
      </IconButton>
    </HStack>
  );
}

function SunOrMoon() {
  const { colorMode } = useColorMode();

  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      {colorMode === "light" ? (
        <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z" />
      ) : (
        <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z" />
      )}
    </svg>
  );
}
