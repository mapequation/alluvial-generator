import { range } from "d3";

const id = (level: number) => `shadow${level}`;

export default function DropShadows({ maxLevel = 1 }) {
  const levels = range(1, maxLevel + 1);

  return (
    <>
      {levels.map((level, key) => (
        <filter
          key={key}
          id={id(level)}
          x="-50%"
          y="-100%"
          width="200%"
          height="400%"
        >
          <feDropShadow
            dx={1.5 + 0.2 * level}
            dy={1.5 + 0.2 * level}
            stdDeviation={1 + 0.1 * level}
            floodOpacity={0.5}
          />
        </filter>
      ))}
    </>
  );
}

DropShadows.getUrl = function (level: number) {
  return `url(#${id(level)})`;
};

DropShadows.filter = function (enabled = true) {
  return enabled
    ? (d: { moduleLevel: number }) => DropShadows.getUrl(d.moduleLevel)
    : () => "none";
};
