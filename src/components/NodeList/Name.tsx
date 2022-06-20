import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";

export default observer(function Name({
  name,
  highlightIndex,
}: {
  name: string;
  highlightIndex?: number;
}) {
  const store = useContext(StoreContext);

  return (
    <span style={{ color: store.getHighlightColor(highlightIndex, "#000") }}>
      {name}
    </span>
  );
});
