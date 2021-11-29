type Handler = (e: MouseEvent) => void;

export default function useOnClick({
  onClick,
  onDoubleClick,
  delay = 250,
}: {
  onClick: Handler;
  onDoubleClick: Handler;
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
