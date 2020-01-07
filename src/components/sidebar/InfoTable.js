import React from "react";
import { Icon, Input, Table } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";


const toPrecision = (flow, precision = 3) => Number.parseFloat(flow).toPrecision(precision);

const selectable = { selectable: true, style: { padding: "0 8px" } };

export default class InfoTable extends React.PureComponent {
  static contextType = Dispatch;

  handleNameChange = (e, { value }) => {
    if (!this.props.module) return;
    this.props.module.name = value;
    this.setState({ name: value });
    this.context.dispatch({ type: "changeName" });
  };

  handleNetworkNameChange = (e, { value }) => {
    if (!this.props.module) return;
    this.props.module.networkName = value;
    this.setState({ networkName: value });
    this.context.dispatch({ type: "changeName" });
  };

  clearName = () => this.handleNameChange(null, { value: "" });
  clearNetworkName = () => this.handleNetworkNameChange(null, { value: "" });

  constructor(props) {
    super(props);

    if (props.module) {
      this.state = {
        name: props.module.name || "",
        networkName: props.module.networkName
      };
    }
  }

  componentDidUpdate(prev) {
    const { module } = this.props;
    if (module !== prev.module) {
      this.setState({
        name: module.name || "",
        networkName: module.networkName
      });
    }
  }

  render() {
    const {
      name,
      networkName,
      networkCodelength,
      flow,
      numLeafNodes,
      moduleId,
      moduleLevel,
      largestLeafNodes
    } = this.props.module;

    return <Table celled striped compact size="small">
      <Table.Body>
        <Table.Row>
          <Table.Cell width={5}>Network</Table.Cell>
          <Table.Cell {...selectable}>
            <Input
              fluid
              transparent
              value={networkName}
              placeholder="Set network name..."
              onChange={this.handleNetworkNameChange}
              icon={networkName && <Icon link name="x" onClick={this.clearNetworkName}/>}
            />
          </Table.Cell>
        </Table.Row>
        {networkCodelength != null &&
        <Table.Row>
          <Table.Cell>Codelength</Table.Cell>
          <Table.Cell>{toPrecision(networkCodelength, networkCodelength > 0 ? 4 : 1)} bits</Table.Cell>
        </Table.Row>
        }
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
              value={name}
              placeholder="Set module name..."
              onChange={this.handleNameChange}
              icon={name && <Icon link name="x" onClick={this.clearName}/>}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Largest nodes</Table.Cell>
          <Table.Cell>{largestLeafNodes.join(", ")}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>;
  }
}
