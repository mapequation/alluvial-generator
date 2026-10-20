import { NativeSelect } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import {
  schemeIsHueSource,
  TONES,
  ToneName,
} from "@mapequation/alluvial-diagram";

type Props = React.ComponentProps<typeof NativeSelect.Root>;

const ToneSelect = observer(function ToneSelect(props: Props) {
  const store = useContext(StoreContext);

  return (
    <NativeSelect.Root
      size="sm"
      variant="plain"
      display="inline-block"
      // Schemes that are lists of colors set their own tone
      disabled={!schemeIsHueSource(store.selectedSchemeName)}
      {...props}
    >
      <NativeSelect.Field
        value={store.selectedTone}
        onChange={(event) =>
          store.setSelectedTone(event.target.value as ToneName)
        }
      >
        {TONES.map((tone) => (
          <option key={tone} value={tone}>
            {tone.charAt(0).toUpperCase() + tone.slice(1)}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
});

export default ToneSelect;
