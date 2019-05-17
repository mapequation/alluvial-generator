import PropTypes from "prop-types";
import React from "react";
import { Table } from "semantic-ui-react";


export default class DraggableTableRow extends React.PureComponent {
  static propTypes = {
    action: PropTypes.func.isRequired,
  };

  onDragStart = (ev, i) => ev.dataTransfer.setData("index", i);

  onDragOver = ev => ev.preventDefault();

  onDrop = (ev, a) => {
    const b = ev.dataTransfer.getData("index");
    this.props.action(parseInt(a, 10), parseInt(b, 10));
  };

  render() {
    const { index, children } = this.props;
    return (
      <Table.Row
        draggable
        className="draggable"
        onDragStart={e => this.onDragStart(e, index)}
        onDragOver={e => this.onDragOver(e)}
        onDrop={e => this.onDrop(e, index)}
      >
        {children}
      </Table.Row>
    );
  }
}
