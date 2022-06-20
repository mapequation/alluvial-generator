import { Select, SelectProps } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import { SCHEME_GROUPS, SchemeName } from "../../store/schemes";

const ColorSchemeSelect = observer(function ColorSchemeSelect(
  props: SelectProps
) {
  const store = useContext(StoreContext);

  return (
    <Select
      size="sm"
      variant="flushed"
      display="inline-block"
      value={store.selectedSchemeName}
      onChange={(event) =>
        store.setSelectedScheme(event.target.value as SchemeName)
      }
      sx={{
        "> optgroup": { color: "gray.900", fontStyle: "normal" },
      }}
      {...props}
    >
      {Array.from(Object.entries(SCHEME_GROUPS)).map(([group, schemes]) => (
        <optgroup label={group} key={group}>
          {schemes.map((scheme) => (
            <option key={scheme} value={scheme}>
              {scheme}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
});

export default ColorSchemeSelect;
