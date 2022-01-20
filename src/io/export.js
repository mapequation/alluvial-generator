import FileSaver from "file-saver";

export function saveSvg(svg, filename) {
  const labels = svg.querySelectorAll("text");
  const rects = svg.querySelectorAll(".group");

  [...labels, ...rects].forEach((element) => {
    const style = element.getAttribute("style");
    if (!style) return;

    const parts = style.split(";");
    for (const part of parts) {
      const matches = [...part.matchAll(/translate([X|Y])\((-?\d+)/g)];
      if (matches.length === 0) continue;
      const x = matches[0]?.[2] ?? 0;
      const y = matches[1]?.[2] ?? 0;
      element.setAttribute("x", x);
      element.setAttribute("y", y);
    }

    element.setAttribute("data-style", style);
    element.removeAttribute("style");
  });

  const string = new XMLSerializer().serializeToString(svg);

  [...labels, ...rects].forEach((element) => {
    element.removeAttribute("x");
    element.removeAttribute("y");

    const style = element.getAttribute("data-style");
    if (!style) return;
    element.setAttribute("style", style);
    element.removeAttribute("data-style");
  });

  const blob = new Blob([string], { type: "image/svg+xml;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
}

export function saveDiagram(version, networks, root, state = {}) {
  const filename = networks.map((network) => network.name).join(",") + ".json";

  const getNetwork = (id) => {
    const network = root.getNetwork(id);
    if (!network) {
      console.error(`No network found with id ${id}`);
      return;
    }
    return network;
  };

  const nodes = (id) => {
    const network = getNetwork(id);
    return network
      ? Array.from(network.leafNodes()).map(
          ({
            id,
            flow,
            name,
            nodeId,
            identifier,
            insignificant,
            highlightIndex,
            moduleLevel,
          }) => ({
            path: id,
            flow,
            name,
            id: nodeId,
            identifier,
            insignificant,
            highlightIndex,
            moduleLevel,
          })
        )
      : null;
  };

  const name = (id) => {
    const network = getNetwork(id);
    return network ? network.name : null;
  };

  const moduleNames = (id) => {
    const network = getNetwork(id);
    return network ? network.getModuleNames() : [];
  };

  const json = JSON.stringify(
    {
      version,
      timestamp: +new Date(),
      state,
      networks: networks.map((network) => ({
        id: network.id,
        name: name(network.id) || network.name,
        codelength: network.codelength,
        moduleNames: moduleNames(network.id),
        nodes: nodes(network.id) || [],
      })),
    },
    null,
    2
  );

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
}
