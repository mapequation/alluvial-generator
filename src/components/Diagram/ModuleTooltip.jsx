import { Table, Tbody, Td, Tr } from "@chakra-ui/react";
import {
  CartesianGrid,
  Cell,
  Dot,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

export default function ModuleTooltip({ module, fillColor }) {
  const leafNodes = module.getLeafNodes();
  const numNodes = leafNodes.length;
  const totalNumNodes = module.parent.nodesByIdentifier.size;
  const fractionNodes = (100 * numNodes) / totalNumNodes;

  const data = leafNodes
    .map((node) => ({
      nodeId: node.nodeId,
      flow: node.flow,
      fill: fillColor(node),
    }))
    .sort((a, b) => b.flow - a.flow);

  return (
    <>
      <Table variant="unstyled" size="sm">
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
              {numNodes} ({fractionNodes.toPrecision(2)}%)
            </Td>
          </Tr>
          <Tr>
            <Td>Sub-modules</Td>
            <Td>{module.hasSubmodules ? "Yes" : "No"}</Td>
          </Tr>
        </Tbody>
      </Table>

      <ScatterChart
        width={240}
        height={150}
        fill="currentColor"
        style={{ fontSize: "0.8em" }}
      >
        <CartesianGrid fill="white" vertical={false} horizontal={false} />
        <Scatter
          data={data}
          dataKey="flow"
          isAnimationActive={false}
          shape={<Dot r={3} />}
        >
          {data.map((node, index) => (
            <Cell key={`cell-${index}`} fill={node.fill} />
          ))}
        </Scatter>
        <YAxis
          dataKey="flow"
          type="number"
          tickFormatter={(value) => (value === 0 ? 0 : value.toPrecision(1))}
          tickCount={4}
          label={{ value: "Flow", angle: -90, position: "insideLeft" }}
          stroke="currentColor"
        />
        <XAxis
          dataKey="nodeId"
          tick={false}
          domain={[-1, "dataMax"]}
          label={{ value: "Nodes", position: "insideBottom" }}
          stroke="currentColor"
        />
      </ScatterChart>
    </>
  );
}
