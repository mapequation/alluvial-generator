import { Cell, Curve, Pie, PieChart } from "recharts";
import { clamp } from "../../../utils/math";

export function PiePlot({ data, fillColor }) {
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
