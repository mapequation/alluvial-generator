import { observer } from "mobx-react";
import { useContext, useRef } from "react";
import { StoreContext } from "../../store";

export default observer(function Diagram() {
  const store = useContext(StoreContext);

  return <div></div>;
});
