import { ButtonGroup } from "@chakra-ui/react";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { Categorical as CategoricalData } from "../../../alluvial/Network";
import useMap from "../../../hooks/useMap";
import { StoreContext } from "../../../store";
import { Button } from "../utils";

interface CategoricalProps {
  name: string;
  data: CategoricalData;
  color: string;
}

export default observer(function Categorical({
  name,
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
          onClick={() => store.colorCategoricalMetadata(name, map)}
          justifyContent="center"
        >
          Paint current colors
        </Button>
      </ButtonGroup>
    </>
  );
});
