import FileSaver from "file-saver";

export function saveSvg(svg, filename) {
  const width = svg.getAttribute("width");
  const height = svg.getAttribute("height");
  const viewBox = svg.getAttribute("viewBox");
  let diagramWidth = Number(svg.getAttribute("data-width")) + 10;
  let diagramHeight = Number(svg.getAttribute("data-height")) + 10;

  const background = svg.querySelector(".background");

  const zoomable = svg.getElementById("zoomable");
  const zoom = zoomable?.getAttribute("transform");
  zoomable?.removeAttribute("transform");

  const translateCenter = svg.getElementById("translate-center");
  const translate = translateCenter?.getAttribute("style");
  translateCenter?.removeAttribute("style");

  const labels = svg.querySelectorAll(".label");
  const groups = svg.querySelectorAll(".group");
  const superModules = svg.querySelectorAll(".super-module");
  const superModuleOffsets = svg.querySelectorAll(".super-module-offset");
  const modules = [...groups, ...superModules];

  modules.forEach((element) => {
    element.setAttribute("x", element.getAttribute("data-x"));
    element.setAttribute("y", element.getAttribute("data-y"));
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  superModuleOffsets.forEach((element) => {
    const x = element.getAttribute("data-x");
    const y = element.getAttribute("data-y");
    element.setAttribute("transform", `translate(${x} ${y})`);
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  let maxLabelWidth = -Infinity;
  let hasLabels = false;

  labels.forEach((element) => {
    hasLabels = true;
    const text = element.querySelector("text");
    const bbox = text.getBBox();
    maxLabelWidth = Math.max(maxLabelWidth, bbox.width);
    text.setAttribute("x", text.getAttribute("data-x"));
    text.setAttribute("y", text.getAttribute("data-y"));
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  if (hasLabels && maxLabelWidth > -Infinity) {
    const textPadding = 20; // From Module.namePosition
    diagramWidth += 2 * (maxLabelWidth + textPadding);
    translateCenter?.setAttribute(
      "transform",
      `translate(${maxLabelWidth + 15} 0)`
    );

    diagramHeight += 80; // Hack to fit network names
  }

  svg.setAttribute("width", diagramWidth);
  svg.setAttribute("height", diagramHeight);
  svg.setAttribute("viewBox", `0 0 ${diagramWidth} ${diagramHeight}`);
  background?.setAttribute("width", diagramWidth);
  background?.setAttribute("height", diagramHeight);

  const string = new XMLSerializer().serializeToString(svg);

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", viewBox);
  background?.setAttribute("width", width);
  background?.setAttribute("height", height);

  zoomable?.setAttribute("transform", zoom);
  translateCenter?.removeAttribute("transform");
  translateCenter?.setAttribute("style", translate);

  modules.forEach((element) => {
    element.removeAttribute("x");
    element.removeAttribute("y");
    element.setAttribute("style", element.getAttribute("data-style"));
    element.removeAttribute("data-style");
  });

  superModuleOffsets.forEach((element) => {
    element.removeAttribute("transform");
    element.setAttribute("style", element.getAttribute("data-style"));
    element.removeAttribute("data-style");
  });

  labels.forEach((element) => {
    const text = element.querySelector("text");
    text.removeAttribute("x");
    text.removeAttribute("y");
    element.setAttribute("style", element.getAttribute("data-style"));
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
