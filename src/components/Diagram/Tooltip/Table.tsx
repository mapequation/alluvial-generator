import { Table as CkTable, Tbody, Td, Tr } from "@chakra-ui/react";
import type { Module } from "../../../alluvial";

export function Table({
  module,
  numNodes,
}: {
  module: Module;
  numNodes: number;
}) {
  const totalNumNodes = module.parent?.numLeafNodes ?? 0;
  const fractionNodes = (100 * numNodes) / totalNumNodes;

  return (
    <CkTable variant="unstyled" size="sm" mt={1}>
      <Tbody>
        <Tr>
          <Td>Module</Td>
          <Td>{module.moduleId}</Td>
        </Tr>
        <Tr>
          <Td>Level</Td>
          <Td>
            {module.moduleLevel}
            {module.isTopModule
              ? " (top)"
              : module.isLeafModule
              ? " (leaf)"
              : ""}
          </Td>
        </Tr>
        <Tr>
          <Td>Flow</Td>
          <Td>{module.flow.toPrecision(3)}</Td>
        </Tr>
        <Tr>
          <Td>Leaf nodes</Td>
          <Td>
            {numNodes} ({fractionNodes.toFixed(1)}%)
          </Td>
        </Tr>
        <Tr>
          <Td>Sub-modules</Td>
          <Td>{module.hasSubmodules ? "Yes" : "No"}</Td>
        </Tr>
      </Tbody>
    </CkTable>
  );
}
