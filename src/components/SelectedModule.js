import React, { useContext, useLayoutEffect, useState } from "react";
import Draggable from "react-draggable";
import { Container, Header, Icon, Input, Portal, Segment, Table } from "semantic-ui-react";
import Dispatch from "../context/Dispatch";


const toPrecision = (flow, precision = 3) => Number.parseFloat(flow).toPrecision(precision);

export default function SelectedModule(props) {
  const { module, open } = props;
  const { dispatch } = useContext(Dispatch);
  const [name, setName] = useState("");

  const handleChange = name => {
    if (!module) return;
    module.name = name;
    setName(name);
    dispatch({ type: "selectedModuleNameChange" });
  };

  useLayoutEffect(() => {
    if (!module) return;
    setName(module.name || "");
  }, [module]);

  return <Portal open={open && !!module}>
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
        >
          Selected module
        </Header>
        <Table celled striped compact fixed singleLine size="small">
          {module &&
          <Table.Body>
            <Table.Row>
              <Table.Cell width={4}>Network</Table.Cell>
              <Table.Cell>{module.networkName}</Table.Cell>
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
              <Table.Cell selectable style={{ padding: "0 0 0 8px" }}>
                {module &&
                <Input transparent fluid
                       value={name}
                       icon={name && <Icon link name="x" onClick={() => handleChange("")}/>}
                       placeholder="Set module name..."
                       onChange={(e, { value }) => handleChange(value)}/>
                }
              </Table.Cell>
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
  </Portal>;
}
