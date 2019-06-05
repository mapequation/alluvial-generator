import React, { useContext, useLayoutEffect, useState } from "react";
import Draggable from "react-draggable";
import { Container, Header, Icon, Input, Segment, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


const SelectableTableCell = props => <Table.Cell selectable style={{ padding: "0 8px" }} {...props}/>;

const toPrecision = (flow, precision = 3) => Number.parseFloat(flow).toPrecision(precision);

export default function SelectedModule(props) {
  const { module } = props;
  const { dispatch } = useContext(Dispatch);
  const [name, setName] = useState("");
  const [networkName, setNetworkName] = useState("");

  const handleChange = (setName, prop) => (e, { value }) => {
    if (!module) return;
    module[prop] = value;
    setName(value);
    dispatch({ type: "selectedModuleNameChange" });
  };

  const handleNameChange = handleChange(setName, "name");
  const handleNetworkNameChange = handleChange(setNetworkName, "networkName");

  useLayoutEffect(() => {
    if (!module) return;
    setName(module.name || "");
    setNetworkName(module.networkName);
  }, [module]);

  return (
    <Draggable handle=".draggable">
      <Segment
        as={Container}
        raised
        text
        style={{ right: "360px", position: "fixed", bottom: "10px" }}
      >
        <Header
          as="h4"
          className="draggable"
          style={{ cursor: "pointer" }}
          content="Selected module"
        />
        <Table celled striped compact fixed singleLine size="small">
          {module &&
          <Table.Body>
            <Table.Row>
              <Table.Cell width={4}>Network</Table.Cell>
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
            <Table.Row>
              <Table.Cell>Codelength</Table.Cell>
              <Table.Cell>
                {toPrecision(module.networkCodelength, module.networkCodelength > 0 ? 4 : 1)} bits
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Flow</Table.Cell>
              <Table.Cell>{toPrecision(module.flow)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Number of nodes</Table.Cell>
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
      </Segment>
    </Draggable>
  );
}
