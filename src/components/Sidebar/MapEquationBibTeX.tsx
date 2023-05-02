type Props = {
  currentYear?: number;
};

export default function MapEquationBibTeX({
  currentYear = new Date().getFullYear(),
}: Props) {
  const bibtex = `@misc{mapequation${currentYear}software,
    title = {{The MapEquation software package}},
    author = {Edler, Daniel and Holmgren, Anton and Rosvall, Martin},
    year = ${currentYear},
    howpublished = {\\url{https://mapequation.org}},
}`;

  return <>{bibtex}</>;
}
