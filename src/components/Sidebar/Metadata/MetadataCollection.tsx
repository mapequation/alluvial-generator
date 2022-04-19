import { useState } from "react";
import type {
  Categorical as CategoricalData,
  Real as RealData,
} from "../../../alluvial/Network";
import MetadataSelect from "./MetadataSelect";
import { Categorical, Real } from "./MetadataView";

interface MetadataCollectionProps {
  metadata: { [key: string]: CategoricalData | RealData };
}

export default function MetadataCollection({
  metadata,
}: MetadataCollectionProps) {
  const options = Array.from(Object.keys(metadata));
  const [selectedMeta, setSelectedMeta] = useState(options[0]);
  const data = metadata[selectedMeta];

  return (
    <>
      <MetadataSelect
        selectedMeta={selectedMeta}
        setSelectedMeta={setSelectedMeta}
        options={options}
      />

      {data.kind === "categorical" && <Categorical data={data} />}
      {data.kind === "real" && <Real data={data} />}
    </>
  );
}
