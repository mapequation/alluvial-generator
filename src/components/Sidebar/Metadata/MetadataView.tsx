import { ButtonGroup } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  Categorical as CategoricalData,
  Real as RealData,
} from "../../../alluvial/Network";
import useMap from "../../../hooks/useMap";
import { StoreContext } from "../../../store";
import { Button } from "../utils";

interface CategoricalProps {
  data: CategoricalData;
  color: string;
}

export const Categorical = observer(function Categorical({
  data,
  color,
}: CategoricalProps) {
  const store = useContext(StoreContext);
  const { selectedScheme } = store;

  const [map, actions] = useMap(
    data.counts.map(({ category }, i) => [
      category,
      selectedScheme[i % selectedScheme.length],
    ])
  );

  return (
    <>
      <BarChart
        width={300}
        height={200}
        data={data.counts}
        style={{ color: "#333" }}
        onClick={({ activeLabel }) => {
          console.log(activeLabel, color);
          if (activeLabel) actions.set(activeLabel, color);
        }}
      >
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count">
          {data.counts.map((entry, i) => (
            <Cell
              cursor="pointer"
              fill={map.get(entry.category)}
              key={`cell-${i}`}
            />
          ))}
        </Bar>
      </BarChart>

      <ButtonGroup isAttached w="100%" mt={1}>
        <Button
          onClick={() =>
            store.colorCategoricalMetadata(map as Map<string, string>)
          }
          justifyContent="center"
        >
          Paint metadata
        </Button>
      </ButtonGroup>
    </>
  );
});

interface RealProps {
  data: RealData;
}

export function Real({ data }: RealProps) {
  return (
    <>
      <ScatterChart width={300} height={200} data={data.values}>
        <XAxis dataKey="node" />
        <YAxis />
        <Scatter type="monotone" dataKey="value" fill="#8884d8" />
      </ScatterChart>
      Stddev: {data.stddev}
      <br />
      Mean: {data.mean}
      <br />
      Quartiles: {data.quartiles.join(" - ")}
      <br />
    </>
  );
}
