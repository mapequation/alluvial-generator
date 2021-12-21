import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import LinearGradients from "./LinearGradients";
import Streamline from "./Streamline";
import Module from "./Module";

const Network = observer(function Network({ network, groupFillColor }) {
  const store = useContext(StoreContext);
  const { streamlineThreshold, streamlineOpacity, fontSize, showNetworkNames } =
    store;

  const links = network.getLinks(streamlineThreshold);
  const uniqueIndices = new Set();

  for (const { leftHighlightIndex, rightHighlightIndex } of links) {
    uniqueIndices.add(`${leftHighlightIndex}_${rightHighlightIndex}`);
  }

  const activeIndices = Array.from(uniqueIndices, (indices) =>
    indices.split("_").map(Number)
  );

  return (
    <g className="network">
      <defs>
        <LinearGradients activeIndices={activeIndices} />
      </defs>
      {showNetworkNames && (
        <text
          className="name"
          fontSize={fontSize}
          dy={3}
          textAnchor="middle"
          {...network.namePosition}
        >
          {network.name}
        </text>
      )}

      {links.map((link) => (
        <Streamline key={link.id} link={link} opacity={streamlineOpacity} />
      ))}

      {network.visibleChildren.map((module) => (
        <Module key={module.id} module={module} fillColor={groupFillColor} />
      ))}
    </g>
  );
});

export default Network;
