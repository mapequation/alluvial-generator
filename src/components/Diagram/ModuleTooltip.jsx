import { Box, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const bin = d3.bin();
bin.value((d) => d.flow);

export default React.memo(function ModuleTooltip({ module, fillColor }) {
  const { data, bins } = useMemo(() => {
    const data = module.getLeafNodes().sort((a, b) => b.flow - a.flow);
    return { data, bins: bin(data) };
  }, [module]);

  const highlightIndices = new Set();
  let total = 0;

  const hist = bins.map((bin, i) => {
    const stacks = {
      name: i,
      x0: bin.x0,
      x1: bin.x1,
    };

    bin.forEach(({ highlightIndex, flow }) => {
      if (!stacks[highlightIndex]) {
        stacks[highlightIndex] = 0;
        highlightIndices.add(highlightIndex);
      }

      stacks[highlightIndex] += flow;
      total += flow;
    });

    return stacks;
  });

  // Normalize
  hist.forEach((bin) => {
    for (let index of highlightIndices) {
      if (!bin[index]) continue;
      bin[index] /= total;
    }
  });

  const numNodes = data.length;
  const totalNumNodes = module.parent.nodesByIdentifier.size;
  const fractionNodes = (100 * numNodes) / totalNumNodes;

  const largest = data.slice(0, 10);

  return (
    <>
      <Table variant="unstyled" size="sm" mt={1}>
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
      </Table>

      <Box
        bg="white"
        borderRadius="sm"
        boxShadow="md"
        pt={3}
        pl={1}
        pr={2}
        mx={2}
        my={4}
        minH={240}
        minW={240}
      >
        <BarPlot
          data={hist}
          indices={Array.from(highlightIndices)}
          fillColor={fillColor}
        />

        <PiePlot data={largest} fillColor={fillColor} />
      </Box>
    </>
  );
});

function BarPlot({ data, indices, fillColor }) {
  return (
    <BarChart
      width={240}
      height={150}
      data={data}
      style={{ fontSize: "0.8em" }}
    >
      {indices.map((highlightIndex) => (
        <Bar
          key={highlightIndex}
          dataKey={highlightIndex}
          stackId="a"
          fill={fillColor({ highlightIndex })}
        />
      ))}
      <YAxis tickFormatter={(value) => value.toFixed(1)}>
        <Label value="Fraction" angle={-90} position="insideLeft" fill="#444" />
      </YAxis>
      <XAxis dataKey="x1">
        <Label value="Flow" position="insideBottom" offset={0} fill="#444" />
      </XAxis>
    </BarChart>
  );
}

function PiePlot({ data, fillColor }) {
  return (
    <PieChart width={240} height={140} style={{ fontSize: "0.7em" }}>
      <Pie
        data={data}
        dataKey="flow"
        nameKey="name"
        outerRadius={40}
        label={PieLabel}
        animationDuration={400}
      >
        {data.map((node, index) => (
          <Cell key={`cell-${index}`} fill={fillColor(node)} />
        ))}
      </Pie>
    </PieChart>
  );
}

function PieLabel({ x, y, textAnchor, name }) {
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#444">
      {name}
    </text>
  );
}
