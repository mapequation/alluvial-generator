import React, { useContext, useLayoutEffect, useState } from "react";
import { GithubPicker } from "react-color";
import { Button, Icon, Input, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


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
  const {
    module,
    highlightColors,
    defaultHighlightColor,
    networkId,
    setNetworkId,
    moduleIds,
    setModuleIds
  } = props;

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

  if (!module) {
    return;
  }

  const buttonProps = { compact: true, size: "tiny", basic: true, fluid: true };
  const selectable = { selectable: true, style: { padding: "0 8px" } };

  return (
    <React.Fragment>
      <Button.Group {...buttonProps}>
        <Button
          icon="plus"
          content="Expand module"
          onClick={() => {
            dispatch({ type: "expand" });
            setButtonsEnabled(false);
          }}
          disabled={!buttonsEnabled || module.moduleLevel === module.maxModuleLevel}
        />
        <Button
          icon="minus"
          content="Contract module"
          onClick={() => {
            dispatch({ type: "regroup" });
            setButtonsEnabled(false);
          }}
          disabled={!buttonsEnabled || module.moduleLevel === 1}
        />
      </Button.Group>
      <Button.Group
        {...buttonProps}
        style={{ margin: "4px 0 0 0 " }}
      >
        <Button
          content="Add to module filter"
          onClick={() => {
            const ids = networkId === module.networkId ? moduleIds : [];
            setNetworkId(module.networkId);
            setModuleIds([...ids, module.moduleId]);
          }}
          disabled={moduleIds.includes(module.moduleId)}
        />
        <Button
          content="Remove from module filter"
          onClick={() => setModuleIds(moduleIds.filter(moduleId => moduleId !== module.moduleId))}
          disabled={!moduleIds.includes(module.moduleId)}
        />
      </Button.Group>
      <Table celled striped compact fixed singleLine size="small">
        <Table.Body>
          <Table.Row>
            <Table.Cell width={5}>Network</Table.Cell>
            <Table.Cell {...selectable}>
              <Input
                fluid
                transparent
                value={networkName}
                placeholder="Set network name..."
                onChange={handleNetworkNameChange}
              />
            </Table.Cell>
          </Table.Row>
          {module.networkCodelength != null &&
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
            <Table.Cell {...selectable}>
              <Input
                fluid
                transparent
                value={name}
                placeholder="Set module name..."
                onChange={handleNameChange}
                icon={name && <Icon link name="x" onClick={() => handleNameChange(null, { value: "" })}/>}
              />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Largest nodes</Table.Cell>
            <Table.Cell>{module.largestLeafNodes.join(", ")}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Swatch background={color}/>
      <GithubPicker
        colors={[defaultHighlightColor, ...highlightColors]}
        onChangeComplete={handleColorChange}
      />
      <Button.Group {...buttonProps} style={{ margin: "4px 0 0 0" }}>
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
