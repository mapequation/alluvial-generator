import React from "react";
import { Table } from "semantic-ui-react";


export default function DraggableTableRow(props) {
  const { action, index, children } = props;

  const onDragStart = e => e.dataTransfer.setData("index", index);

  const onDragOver = e => e.preventDefault();

  const onDrop = e => {
    const fromIndex = e.dataTransfer.getData("index");
    action(parseInt(index, 10), parseInt(fromIndex, 10));
  };

  return (
    <Table.Row
      draggable
      className="draggable"
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </Table.Row>
  );
}
