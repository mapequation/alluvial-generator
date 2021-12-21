import { drawerWidth } from "../App";

export default function translateCenter({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  let { innerWidth, innerHeight } = window;
  innerWidth -= drawerWidth;

  const dx = Math.max((innerWidth - width) / 2, 100);
  const dy = Math.max((innerHeight - height) / 3, 100);

  return `translate(${dx}, ${dy})`;
}
