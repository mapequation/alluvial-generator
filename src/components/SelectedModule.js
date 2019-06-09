import React, { useContext, useLayoutEffect, useState } from "react";
import { GithubPicker } from "react-color";
import { Checkbox, Icon, Input, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


const SelectableTableCell = props => <Table.Cell selectable style={{ padding: "0 8px" }} {...props}/>;

const toPrecision = (flow, precision = 3) => Number.parseFloat(flow).toPrecision(precision);

export default function SelectedModule(props) {
  const { module, highlightColors, defaultHighlightColor } = props;
  const { dispatch } = useContext(Dispatch);
  const [name, setName] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [all, setAll] = useState(false);

  const handleChange = (setName, prop) => (e, { value }) => {
    if (!module) return;
    module[prop] = value;
    setName(value);
    dispatch({ type: "selectedModuleNameChange" });
  };

  const handleNameChange = handleChange(setName, "name");
  const handleNetworkNameChange = handleChange(setNetworkName, "networkName");

  const handleColorChange = color => {
    module.highlightIndex = highlightColors.indexOf(color.hex);
    dispatch({ type: all ? "selectedModuleColorChangeAll" : "selectedModuleColorChange" });
  };

  useLayoutEffect(() => {
    if (!module) return;
    setName(module.name || "");
    setNetworkName(module.networkName);
  }, [module]);

  return (
    <React.Fragment>
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
      <GithubPicker
        triangle="hide"
        colors={[...highlightColors, defaultHighlightColor]}
        onChangeComplete={handleColorChange}
      />
      <Checkbox
        checked={all}
        style={{ display: "block", margin: "0.3em 0" }}
        label="Paint contained nodes in all networks"
        onChange={(e, { checked }) => setAll(checked)}
      />
    </React.Fragment>
  );
}
