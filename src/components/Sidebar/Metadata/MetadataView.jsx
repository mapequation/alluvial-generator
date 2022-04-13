import { Select } from "@chakra-ui/react";
import { useState } from "react";
import { Bar, BarChart, Scatter, ScatterChart, XAxis, YAxis } from "recharts";

export function MetadataView({ metadata }) {
  const options = Array.from(Object.keys(metadata));
  const [selectedMeta, setSelectedMeta] = useState(options[0]);
  const data = metadata[selectedMeta];
  const MetaView = data.kind === "categorical" ? Categorical : Real;

  return (
    <>
      <MetaSelect
        selectedMeta={selectedMeta}
        setSelectedMeta={setSelectedMeta}
        options={options}
      />

      <MetaView data={data} />
    </>
  );
}

function MetaSelect({ selectedMeta, setSelectedMeta, options }) {
  return (
    <Select
      size="sm"
      w="50%"
      variant="flushed"
      display="inline-block"
      value={selectedMeta}
      onChange={(event) => setSelectedMeta(event.target.value)}
    >
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </Select>
  );
}

function Categorical({ data }) {
  return (
    <BarChart width={300} height={200} data={data.counts}>
      <XAxis dataKey="category" />
      <YAxis />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

function Real({ data }) {
  return (
    <ScatterChart width={300} height={200} data={data.values}>
      <XAxis dataKey="node" />
      <YAxis />
      <Scatter type="monotone" dataKey="value" fill="#8884d8" />
    </ScatterChart>
  );
}
