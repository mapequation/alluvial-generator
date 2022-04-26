import { ButtonGroup } from "@chakra-ui/react";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { Categorical as CategoricalData } from "../../../alluvial/Network";
import useMap from "../../../hooks/useMap";
import { StoreContext } from "../../../store";
import { Button } from "../components";
import { SidebarContext } from "../Sidebar";
import type { MetadataKindProps } from "./MetadataCollection";

export default observer(function Categorical({
  name,
  data,
}: MetadataKindProps<CategoricalData>) {
  const store = useContext(StoreContext);
  const { color } = useContext(SidebarContext);
  const { defaultHighlightColor } = store;

  const [map, actions] = useMap(
    data.counts.map(({ category }) => [category, defaultHighlightColor])
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
