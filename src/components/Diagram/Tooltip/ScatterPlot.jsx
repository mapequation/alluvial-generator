import {
  Cell,
  Dot,
  Label,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

export function ScatterPlot({ data, fillColor }) {
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
