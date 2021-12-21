import { observer } from "mobx-react";
import { useContext, useEffect, useRef } from "react";
import { StoreContext } from "../../store";
import DropShadows from "./DropShadows";
import useOnClick from "../../hooks/useOnClick";
import raise from "../../utils/raise";
import * as d3 from "d3";

const drag = d3.drag().filter((event) => event.shiftKey);

const Module = observer(function Module({ module, fillColor }) {
  const store = useContext(StoreContext);
  const ref = useRef();

  const { fontSize, showModuleId, showModuleNames } = store;
  const dropShadow = DropShadows.filter(store.dropShadow);

  const isSelected = store.selectedModule === module;

  const handler = useOnClick({
    onClick: () => {
      raise(ref?.current);
      store.setSelectedModule(module);
    },
    onDoubleClick: (event) => {
      if (event.shiftKey) {
        store.regroup(module);
      } else {
        store.expand(module);
      }
    },
  });

  useEffect(() => {
    d3.select(ref.current).call(
      drag.on("drag", function (event) {
        const { y } = event;
        d3.select(this).attr("transform", `translate(0, ${y})`);
        console.log(event);
      })
    );
  }, []);

  return (
    <g
      ref={ref}
      className="module"
      style={{ filter: dropShadow(module) }}
      stroke="#f00"
      strokeWidth={isSelected ? 1 : 0}
      onClick={handler}
    >
      {module.children.map((group) => (
        <rect
          key={group.id}
          className="group"
          {...group.layout}
          fill={fillColor(group)}
        />
      ))}

      {showModuleId && (
        <text
          fontSize={fontSize}
          textAnchor="middle"
          dy={3}
          stroke="#fff"
          strokeWidth={3}
          paintOrder="stroke"
          strokeLinecap="round"
          {...module.idPosition}
        >
          {module.moduleId}
        </text>
      )}

      {showModuleNames && module.textAnchor != null && (
        <text
          fontSize={fontSize}
          textAnchor={module.textAnchor}
          dy={3}
          strokeWidth={0}
          fill={isSelected ? "#f00" : "#000"}
          {...module.namePosition}
        >
          {module.largestLeafNodes.join(", ")}
        </text>
      )}
    </g>
  );
});

export default Module;
