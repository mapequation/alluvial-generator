import { useState } from "react";
import type {
  Categorical as CategoricalData,
  Real as RealData,
} from "../../../alluvial/Network";
import Categorical from "./Categorical";
import MetadataSelect from "./MetadataSelect";
import Real from "./Real";

interface MetadataCollectionProps {
  metadata: { [key: string]: CategoricalData | RealData };
  color: string;
}

export default function MetadataCollection({
  metadata,
  color,
}: MetadataCollectionProps) {
  const options = Array.from(Object.keys(metadata));
  const [selectedMeta, setSelectedMeta] = useState(options[0]);
  const data = metadata[selectedMeta];

  if (!data) return null;

  return (
    <>
      <MetadataSelect
        selectedMeta={selectedMeta}
        setSelectedMeta={setSelectedMeta}
        options={options}
      />

      {data.kind === "categorical" && (
        <Categorical name={selectedMeta} data={data} color={color} />
      )}
      {data.kind === "real" && (
        <Real name={selectedMeta} data={data} color={color} />
      )}
    </>
  );
}
