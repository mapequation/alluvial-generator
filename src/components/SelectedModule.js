import React, { useContext, useLayoutEffect, useState } from "react";
import { GithubPicker } from "react-color";
import { Button, Icon, Input, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


const SelectableTableCell = props => <Table.Cell selectable style={{ padding: "0 8px" }} {...props}/>;

const toPrecision = (flow, precision = 3) => Number.parseFloat(flow).toPrecision(precision);

function Swatch(props) {
  return <div style={{
    margin: "0 1px 2px",
    padding: "4px",
    background: "#fff",
    borderRadius: "4px",
    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
    display: "inline-block",
    cursor: "pointer"
  }}>
    <div style={{
      width: "25px",
      height: "25px",
      background: props.background
    }}/>
  </div>;
}

export default function SelectedModule(props) {
  const { module, highlightColors, defaultHighlightColor } = props;
  const { dispatch } = useContext(Dispatch);

  const [name, setName] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [color, setColor] = useState(defaultHighlightColor);
  const [buttonsEnabled, setButtonsEnabled] = useState(true);

  const handleChange = (setName, prop) => (e, { value }) => {
    if (!module) return;
    module[prop] = value;
    setName(value);
    dispatch({ type: "changeName" });
  };

  const handleNameChange = handleChange(setName, "name");
  const handleNetworkNameChange = handleChange(setNetworkName, "networkName");

  const highlightIndex = color => highlightColors.indexOf(color);

  const handleColorChange = color => setColor(color.hex);

  const paintModule = () => {
    module.highlightIndex = highlightIndex(color);
    dispatch({ type: "changeColor" });
  };

  const paintNodes = () => {
    module.highlightIndex = highlightIndex(color);
    dispatch({ type: "changeAllColor" });
  };

  useLayoutEffect(() => {
    if (!module) return;
    setName(module.name || "");
    setNetworkName(module.networkName);
    setButtonsEnabled(true);
  }, [module]);

  return (
    <React.Fragment>
      {module &&
      <Button.Group compact size="tiny" basic>
        <Button
          content="Expand module"
          onClick={() => {
            dispatch({ type: "expand" });
            setButtonsEnabled(false);
          }}
          disabled={!buttonsEnabled || module.moduleLevel === module.maxModuleLevel}
        />
        <Button
          content="Regroup with siblings"
          onClick={() => {
            dispatch({ type: "regroup" });
            setButtonsEnabled(false);
          }}
          disabled={!buttonsEnabled || module.moduleLevel === 1}
        />
      </Button.Group>
      }
      <Table celled striped compact fixed singleLine size="small">
        {module &&
        <Table.Body>
          <Table.Row>
            <Table.Cell width={5}>Network</Table.Cell>
            <SelectableTableCell>
              <Input
                fluid
                transparent
                value={networkName}
                placeholder="Set network name..."
                onChange={handleNetworkNameChange}
              />
            </SelectableTableCell>
          </Table.Row>
          {module.networkCodelength &&
          <Table.Row>
            <Table.Cell>Codelength</Table.Cell>
            <Table.Cell>
              {toPrecision(module.networkCodelength, module.networkCodelength > 0 ? 4 : 1)} bits
            </Table.Cell>
          </Table.Row>
          }
          <Table.Row>
            <Table.Cell>Flow</Table.Cell>
            <Table.Cell>{toPrecision(module.flow)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Nodes</Table.Cell>
            <Table.Cell>{module.numLeafNodes}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Module id</Table.Cell>
            <Table.Cell>{module.moduleId}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Level</Table.Cell>
            <Table.Cell>{module.moduleLevel}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Module name</Table.Cell>
            <SelectableTableCell>
              <Input
                fluid
                transparent
                value={name}
                placeholder="Set module name..."
                onChange={handleNameChange}
                icon={name && <Icon link name="x" onClick={() => handleNameChange(null, { value: "" })}/>}
              />
            </SelectableTableCell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Largest nodes</Table.Cell>
            <Table.Cell>{module.largestLeafNodes.join(", ")}</Table.Cell>
          </Table.Row>
        </Table.Body>
        }
      </Table>
      <Swatch background={color}/>
      <GithubPicker
        colors={[defaultHighlightColor, ...highlightColors]}
        onChangeComplete={handleColorChange}
      />
      <Button.Group compact size="tiny" basic style={{ margin: "4px 0 0 0" }}>
        <Button
          content="Paint module"
          onClick={paintModule}
        />
        <Button
          content="Paint nodes in all networks"
          onClick={paintNodes}
        />
      </Button.Group>
    </React.Fragment>
  );
}
