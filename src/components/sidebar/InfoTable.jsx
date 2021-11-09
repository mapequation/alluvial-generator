import { observer } from "mobx-react";
import { useContext, useState } from "react";
import { Icon, Input, Table } from "semantic-ui-react";
import { StoreContext } from "../../store";

const toPrecision = (flow, precision = 3) =>
  Number.parseFloat(flow).toPrecision(precision);

const selectable = { selectable: true, style: { padding: "0 8px" } };

export default observer(function InfoTable() {
  const store = useContext(StoreContext);
  const module = store.selectedModule; // FIXME
  const [name, setName] = useState(module?.name ?? "");
  const [networkName, setNetworkName] = useState(module?.networkName ?? "");

  const handleNameChange = (name = "") => {
    if (!module) return;
    setName(name);
    store.setModuleName(module, name);
  };

  const handleNetworkNameChange = (name = "") => {
    if (!module) return;
    setNetworkName(name);
    store.setNetworkName(module, name);
  };

  const {
    networkCodelength,
    flow,
    numLeafNodes,
    moduleId,
    moduleLevel,
    largestLeafNodes,
  } = module;

  return (
    <Table celled striped compact size="small">
      <Table.Body>
        <Table.Row>
          <Table.Cell width={5}>Network</Table.Cell>
          <Table.Cell {...selectable}>
            <Input
              fluid
              transparent
              value={networkName || ""}
              placeholder="Set network name..."
              onChange={(_, { value }) => handleNetworkNameChange(value)}
              icon={
                networkName && (
                  <Icon link name="x" onClick={handleNetworkNameChange} />
                )
              }
            />
          </Table.Cell>
        </Table.Row>
        {networkCodelength != null && (
          <Table.Row>
            <Table.Cell>Codelength</Table.Cell>
            <Table.Cell>
              {toPrecision(networkCodelength, networkCodelength > 0 ? 4 : 1)}{" "}
              bits
            </Table.Cell>
          </Table.Row>
        )}
        <Table.Row>
          <Table.Cell>Flow</Table.Cell>
          <Table.Cell>{toPrecision(flow)}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Nodes</Table.Cell>
          <Table.Cell>{numLeafNodes}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Module id</Table.Cell>
          <Table.Cell>{moduleId}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Level</Table.Cell>
          <Table.Cell>{moduleLevel}</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Module name</Table.Cell>
          <Table.Cell {...selectable}>
            <Input
              fluid
              transparent
              value={name || ""}
              placeholder="Set module name..."
              onChange={(_, { value }) => handleNameChange(value)}
              icon={name && <Icon link name="x" onClick={handleNameChange} />}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Largest nodes</Table.Cell>
          <Table.Cell>{largestLeafNodes.join(", ")}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
});
