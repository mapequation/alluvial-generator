import { range } from "d3";

const id = (level) => `shadow${level}`;

export default function DropShadows({ maxLevel = 1 }) {
  const levels = range(1, maxLevel + 1);
  const x = (level) => maxLevel + 1 - level;

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
            dx={0.5 * x(level)}
            dy={0.5 * x(level)}
            stdDeviation={0.5 * x(level)}
            floodOpacity={-0.05 * x(level) + 0.95}
          />
        </filter>
      ))}
    </>
  );
}

DropShadows.getUrl = function (level) {
  return `url(#${id(level)})`;
};

DropShadows.filter = function (enabled = true) {
  return (d) =>
    d.style(
      "filter",
      enabled ? (d) => DropShadows.getUrl(d.moduleLevel) : null
    );
};
