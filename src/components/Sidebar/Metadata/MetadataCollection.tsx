import { useState } from "react";
import type {
  Categorical as CategoricalData,
  Real as RealData,
} from "../../../alluvial/Network";
import { Select } from "../Components";
import Categorical from "./Categorical";
import Real from "./Real";

type Metadata = { [key: string]: CategoricalData | RealData };

export interface MetadataKindProps<DataType> {
  name: string;
  data: DataType;
  diagramData: DataType[];
  color: string;
}

export default function MetadataCollection({
  networkMeta,
  diagramMeta,
  color,
}: {
  networkMeta: Metadata;
  diagramMeta: Metadata[];
  color: string;
}) {
  const options = Array.from(Object.keys(networkMeta));
  const [name, setName] = useState(options[0]);
  const data = networkMeta[name];

  if (!data) return null;

  const diagramData = diagramMeta
    .map((d) => d[name])
    .filter((d) => d.kind === data.kind);

  return (
    <>
      <Select value={name} setValue={setName} options={options} />

      {data.kind === "categorical" && (
        <Categorical
          name={name}
          data={data}
          diagramData={diagramData as CategoricalData[]}
          color={color}
        />
      )}
      {data.kind === "real" && (
        <Real
          name={name}
          data={data}
          diagramData={diagramData as RealData[]}
          color={color}
        />
      )}
    </>
  );
}
