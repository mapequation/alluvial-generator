import UploadIcon from "@mui/icons-material/Upload";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandIcon from "@mui/icons-material/Expand";
import CompressIcon from "@mui/icons-material/Compress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Chip,
  Collapse,
  FormControlLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Radio,
  RadioGroup as MuiRadioGroup,
  Slider as MuiSlider,
  Stack,
  Switch as MuiSwitch,
} from "@mui/material";
import { observer } from "mobx-react";
import { useContext } from "react";
import { TransitionGroup } from "react-transition-group";
import { Direction, StoreContext } from "../../store";

export default observer(function Sidebar({ onLoadClick, onAboutClick }) {
  const store = useContext(StoreContext);
  const { selectedModule /*highlightColors, defaultHighlightColor*/ } = store;
  //const [color, setColor] = useState(defaultHighlightColor);
  console.log("selectedModule", selectedModule);

  const leafNodes = selectedModule ? [...selectedModule.leafNodes()] : [];

  return (
    <>
      <List dense>
        <ListItem>
          <Logo />
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={onLoadClick}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText>Load or arrange</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={onAboutClick}>
            <ListItemIcon>
              <HelpCenterIcon />
            </ListItemIcon>
            <ListItemText>Help and shortcuts</ListItemText>
          </ListItemButton>
        </ListItem>

        <ListSubheader color="primary">Module</ListSubheader>

        <TransitionGroup>
          <Collapse key={selectedModule != null ? "module" : "no-module"}>
            {selectedModule != null ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => store.moveSelectedModule(Direction.Up)}
                    disabled={store.selectedModule === null}
                  >
                    <ListItemIcon>
                      <ArrowUpwardIcon />
                    </ListItemIcon>
                    <ListItemText>Move up</ListItemText>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => store.moveSelectedModule(Direction.Down)}
                    disabled={store.selectedModule === null}
                  >
                    <ListItemIcon>
                      <ArrowDownwardIcon />
                    </ListItemIcon>
                    <ListItemText>Move down</ListItemText>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => store.expand(selectedModule)}
                    disabled={selectedModule.isLeafModule}
                  >
                    <ListItemIcon>
                      <ExpandIcon />
                    </ListItemIcon>
                    <ListItemText>Expand module</ListItemText>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => store.regroup(selectedModule)}
                    disabled={selectedModule.isTopModule}
                  >
                    <ListItemIcon>
                      <CompressIcon />
                    </ListItemIcon>
                    <ListItemText>Contract module</ListItemText>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Network</Label>
                    {selectedModule?.networkName}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Codelength</Label>
                    {selectedModule?.networkCodelength.toPrecision(3) + " bits"}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Module id</Label>
                    {selectedModule?.moduleId}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Name</Label>
                    {selectedModule?.name?.toString()}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Level</Label>
                    {selectedModule?.moduleLevel}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Flow</Label>
                    {selectedModule?.flow.toPrecision(3)}
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <Label>Nodes</Label>
                    {leafNodes.length}
                  </ListItemText>
                </ListItem>

                {/* swatch
            <div
              style={{
                margin: "0 1px 2px",
                padding: "4px",
                background: "#fff",
                borderRadius: "4px",
                boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "25px",
                  height: "25px",
                  background: color,
                }}
              />
            </div>
            <GithubPicker
              colors={[defaultHighlightColor, ...highlightColors]}
              onChangeComplete={(color) => setColor(color.hex)}
            />
            */}
              </>
            ) : (
              <ListItem>
                <ListItemText
                  primary="No module selected."
                  secondary="Click on any module."
                />
              </ListItem>
            )}
          </Collapse>
        </TransitionGroup>

        <ListSubheader color="primary">Layout</ListSubheader>

        <ListItem disablePadding>
          <ListItemButton onClick={() => store.resetLayout()}>
            <ListItemIcon>
              <RestartAltIcon />
            </ListItemIcon>
            <ListItemText>Sort modules</ListItemText>
          </ListItemButton>
        </ListItem>

        <Slider
          label="Height"
          value={store.height}
          min={400}
          max={2000}
          step={10}
          onChange={(value) => store.setHeight(value)}
        />
        <Slider
          label="Module width"
          value={store.moduleWidth}
          min={10}
          max={200}
          step={10}
          onChange={(value) => store.setModuleWidth(value)}
        />
        <Slider
          label="Module spacing"
          value={store.streamlineFraction}
          min={0}
          max={10}
          step={0.1}
          valueLabelFormat={(value) => Math.round(value * 100) + "%"}
          onChange={(value) => {
            return store.setStreamlineFraction(value);
          }}
        />
        <Slider
          label="Margin"
          value={store.marginExponent}
          min={1}
          max={6}
          valueLabelFormat={(value) => 2 ** (value - 1)}
          onChange={(value) => store.setMarginExponent(value)}
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
          onChange={(value) => store.setStreamlineThreshold(value)}
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
          label="Font size"
          value={store.fontSize}
          min={5}
          max={40}
          onChange={(value) => store.setFontSize(value)}
        />

        <RadioGroup
          legend="Module size"
          value={store.moduleSize}
          onChange={(value) => store.setModuleSize(value)}
          options={[
            { value: "flow", label: "Flow" },
            { value: "nodes", label: "Nodes" },
          ]}
        />

        <RadioGroup
          legend="Module order"
          value={store.sortModulesBy}
          onChange={(value) => store.setSortModulesBy(value)}
          options={[
            { value: "flow", label: "Flow" },
            { value: "nodes", label: "Nodes" },
          ]}
        />

        <Switch
          label="Bottom align"
          checked={store.verticalAlign === "bottom"}
          onChange={(value) =>
            store.setVerticalAlign(value ? "bottom" : "justify")
          }
        />
        <Switch
          label="Module ids"
          checked={store.showModuleId}
          onChange={(value) => store.setShowModuleId(value)}
        />
        <Switch
          label="Module names"
          checked={store.showModuleNames}
          onChange={(value) => store.setShowModuleNames(value)}
        />
        <Switch
          label="Network names"
          checked={store.showNetworkNames}
          onChange={(value) => store.setShowNetworkNames(value)}
        />
        <Switch
          label="Drop shadow"
          checked={store.dropShadow}
          onChange={(value) => store.setDropShadow(value)}
        />
      </List>
    </>
  );
});

function Label({ children }) {
  return (
    <span style={{ display: "inline-block", width: "50%" }}>{children}</span>
  );
}

function Slider({ label, value, onChange, ...props }) {
  return (
    <ListItem>
      <ListItemText>{label}</ListItemText>
      <MuiSlider
        sx={{
          width: "50%",
        }}
        size="small"
        defaultValue={value}
        onChangeCommitted={(_, value) => onChange(value)}
        valueLabelDisplay="auto"
        {...props}
      />
    </ListItem>
  );
}

function RadioGroup({ legend, value, onChange, options }) {
  return (
    <ListItem>
      <ListItemText>{legend}</ListItemText>
      <MuiRadioGroup row value={value} onChange={(_, value) => onChange(value)}>
        {options.map(({ value, label }) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio size="small" />}
            label={label}
          />
        ))}
      </MuiRadioGroup>
    </ListItem>
  );
}

function Switch({ onChange, label, ...props }) {
  return (
    <ListItem>
      <ListItemText>{label}</ListItemText>
      <MuiSwitch
        size="small"
        onChange={(_, value) => onChange(value)}
        {...props}
      />
    </ListItem>
  );
}

function Logo() {
  const brand = {
    base: {
      fontFamily: "Philosopher, serif",
      fontWeight: 700,
      fontSize: "1.4em",
    },
    infomap: {
      color: "#555",
    },
    alluvial: {
      color: "#B22222",
    },
  };

  return (
    <Stack
      sx={{ width: "100%" }}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={3}
      >
        <img
          alt="MapEquation"
          width="32px"
          height="32px"
          src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
        />
        <div>
          <span style={brand.base}>
            <span style={brand.infomap}>Alluvial</span>{" "}
            <span style={brand.alluvial}>Generator</span>
          </span>
        </div>
      </Stack>
      <Chip
        size="small"
        variant="outlined"
        label={"v" + process.env.REACT_APP_VERSION}
      />
    </Stack>
  );
}
