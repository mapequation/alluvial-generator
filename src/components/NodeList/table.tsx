import { Checkbox } from "@chakra-ui/react";
import { createTable } from "@tanstack/react-table";
import type { LeafNode } from "../../alluvial";
import { Path } from "./Path";

export const table = createTable().setRowType<LeafNode>();

export const columns = [
  table.createDisplayColumn({
    id: "selection",
    header: ({ instance }) => (
      <Checkbox
        {...{
          isChecked: instance.getIsAllRowsSelected(),
          isIndeterminate: instance.getIsSomeRowsSelected(),
          onChange: instance.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        {...{
          isChecked: row.getIsSelected(),
          isIndeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
      />
    ),
  }),
  table.createDataColumn("name", {
    header: "Name",
    filterFn: "includesString",
  }),
  table.createDataColumn("treePath", {
    header: "Path",
    cell: (props) => <Path path={props.getValue()} />,
  }),
  table.createDataColumn("nodeId", { header: "Id" }),
  table.createDataColumn("stateId", { header: "State Id" }),
  table.createDataColumn("layerId", { header: "Layer" }),
  table.createDataColumn("flow", {
    header: "Flow",
    cell: (props) => props.getValue().toPrecision(3),
  }),
];
