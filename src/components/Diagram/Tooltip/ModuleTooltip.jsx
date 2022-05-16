import { Box, Text } from "@chakra-ui/react";
import * as d3 from "d3";
import React, { useMemo } from "react";
import { BarPlot } from "./BarPlot";
import { PiePlot } from "./PiePlot";
import { ScatterPlot } from "./ScatterPlot";
import { Table } from "./Table";

const bin = d3.bin();
bin.value((d, i) => i);

export default React.memo(function ModuleTooltip({
  module,
  fillColor,
  maxNodes = 50,
}) {
  const { data, bins, hist, highlightIndices } = useMemo(() => {
    const data = module.getLeafNodes().sort((a, b) => b.flow - a.flow);
    const bins = bin(data);

    let hist = undefined;
    let highlightIndices = undefined;

    if (data.length >= maxNodes) {
      highlightIndices = new Set();

      hist = bins.map((bin, i) => {
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
    }

    return { data, bins, hist, highlightIndices };
  }, [module, maxNodes]);

  const numNodes = data.length;
  const largest = numNodes < maxNodes ? data : bins[0].slice(0, maxNodes);

  return (
    <>
      <Table module={module} numNodes={numNodes} />

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
            fillColor={fillColor}
            indices={Array.from(highlightIndices)}
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
