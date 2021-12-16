import { MouseEvent, MouseEventHandler } from "react";

export default function useOnClick({
  onClick,
  onDoubleClick,
  delay = 100,
}: {
  onClick: MouseEventHandler;
  onDoubleClick: MouseEventHandler;
  delay?: number;
}) {
  let clickTimer: number;

  return (e: MouseEvent) => {
    clearTimeout(clickTimer);

    if (e.detail === 1) {
      clickTimer = window.setTimeout(() => onClick(e), delay);
    } else if (e.detail === 2) {
      onDoubleClick(e);
    }
  };
}
