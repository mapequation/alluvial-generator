import { Bar, BarChart, Label, XAxis, YAxis } from "recharts";

export function BarPlot({ data, indices, fillColor }) {
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
