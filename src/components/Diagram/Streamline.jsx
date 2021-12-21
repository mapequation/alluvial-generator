import LinearGradients from "./LinearGradients";
import { streamlineHorizontal } from "../../utils/streamline";

const streamlineGenerator = streamlineHorizontal();

export default function Streamline({ link, opacity }) {
  return (
    <path
      className="streamline"
      fill={LinearGradients.fill(link)}
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
      paintOrder="stroke"
      opacity={opacity}
      d={streamlineGenerator(link.path)}
    />
  );
}
