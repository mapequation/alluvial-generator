import { Select } from "@chakra-ui/react";

interface MetadataSelectProps {
  selectedMeta: string;
  setSelectedMeta: (meta: string) => void;
  options: string[];
}

export default function MetadataSelect({
  selectedMeta,
  setSelectedMeta,
  options,
}: MetadataSelectProps) {
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
