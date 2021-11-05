import { useContext, useState } from "react";
import { Icon, Input, Table } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";

const toPrecision = (flow, precision = 3) =>
  Number.parseFloat(flow).toPrecision(precision);

const selectable = { selectable: true, style: { padding: "0 8px" } };

export default function InfoTable({ module }) {
  const { dispatch } = useContext(Dispatch);
  const [name, setName] = useState(module?.name ?? "");
  const [networkName, setNetworkName] = useState(module?.networkName ?? "");

  const handleNameChange = (e, { value }) => {
    if (!module) return;
    module.name = value;
    setName(value);
    dispatch({ type: "changeName" });
  };

  const handleNetworkNameChange = (e, { value }) => {
    if (!module) return;
    module.networkName = value;
    setNetworkName(value);
    dispatch({ type: "changeName" });
  };

  const clearName = () => handleNameChange(null, { value: "" });
  const clearNetworkName = () => handleNetworkNameChange(null, { value: "" });

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
              onChange={handleNetworkNameChange}
              icon={
                networkName && <Icon link name="x" onClick={clearNetworkName} />
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
              onChange={handleNameChange}
              icon={name && <Icon link name="x" onClick={clearName} />}
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
}
