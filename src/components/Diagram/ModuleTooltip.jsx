import { Box, Table, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Curve,
  Dot,
  Label,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";
import { clamp } from "../../utils/math";

const bin = d3.bin();
bin.value((d, i) => i);

export default React.memo(function ModuleTooltip({ module, fillColor }) {
  const { data, bins } = useMemo(() => {
    const data = module.getLeafNodes().sort((a, b) => b.flow - a.flow);
    return { data, bins: bin(data) };
  }, [module]);

  const highlightIndices = new Set();

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
    });

    return stacks;
  });

  const numNodes = data.length;
  const totalNumNodes = module.parent.nodesByIdentifier.size;
  const fractionNodes = (100 * numNodes) / totalNumNodes;

  const maxNodes = 50;
  const largest = numNodes < maxNodes ? data : bins[0].slice(0, maxNodes);

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
        {numNodes < maxNodes ? (
          <ScatterPlot data={data} fillColor={fillColor} />
        ) : (
          <BarPlot
            data={hist}
            indices={Array.from(highlightIndices)}
            fillColor={fillColor}
          />
        )}

        <Text fontSize="xs" color="#444" align="center" mt={3} mb={2}>
          {numNodes < maxNodes
            ? "Largest nodes"
            : bins[0].length > maxNodes
            ? `Top ${maxNodes} nodes in largest bin`
            : "Nodes in largest bin"}
        </Text>

        <PiePlot data={largest} fillColor={fillColor} />
      </Box>
    </>
  );
});

function ScatterPlot({ data, fillColor }) {
  return (
    <ScatterChart width={240} height={150} style={{ fontSize: "0.8em" }}>
      <Scatter data={data} dataKey="flow" shape={<Dot r={3} />}>
        {data.map((node, i) => (
          <Cell key={`cell-${i}`} fill={fillColor(node)} />
        ))}
      </Scatter>
      <YAxis dataKey="flow" tickFormatter={(value) => value.toFixed(2)}>
        <Label value="Flow" position="insideLeft" fill="#444" angle={-90} />
      </YAxis>
      <XAxis tickFormatter={(value) => value + 1}>
        <Label value="Nodes" position="insideBottom" fill="#444" offset={0} />
      </XAxis>
    </ScatterChart>
  );
}

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
        <Label value="Flow" position="insideLeft" fill="#444" angle={-90} />
      </YAxis>
      <XAxis dataKey="x1">
        <Label value="Nodes" position="insideBottom" fill="#444" offset={0} />
      </XAxis>
    </BarChart>
  );
}

function PiePlot({ data, fillColor }) {
  return (
    <PieChart width={240} height={140} style={{ fontSize: "0.6em" }}>
      <Pie
        data={data}
        dataKey="flow"
        nameKey="name"
        innerRadius={30}
        outerRadius={40}
        label={PieLabel}
        labelLine={LabelLine}
        animationDuration={400}
      >
        {data.map((node, index) => (
          <Cell key={`cell-${index}`} fill={fillColor(node)} />
        ))}
      </Pie>
    </PieChart>
  );
}

function PieLabel({ x, y, textAnchor, name, percent }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#444"
      fontSize={clamp(3 + percent * 100, 3, 10)}
    >
      {name}
    </text>
  );
}

function LabelLine({ percent, ...props }) {
  return (
    <Curve
      {...props}
      opacity={0.5}
      type="linear"
      className="recharts-pie-label-line"
    />
  );
}
