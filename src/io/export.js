import FileSaver from "file-saver";

export function saveSvg(svg, filename) {
  const labels = svg.querySelectorAll(".label");
  const groups = svg.querySelectorAll(".group");
  const superModules = svg.querySelectorAll(".super-module");
  const offsets = svg.querySelectorAll(".super-module-offset");
  const modules = [...groups, ...superModules];

  modules.forEach((element) => {
    element.setAttribute("x", element.getAttribute("data-x"));
    element.setAttribute("y", element.getAttribute("data-y"));
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  offsets.forEach((element) => {
    const x = element.getAttribute("data-x");
    const y = element.getAttribute("data-y");
    element.setAttribute("transform", `translate(${x} ${y})`);
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  labels.forEach((element) => {
    const text = element.querySelector("text");
    text.setAttribute("x", text.getAttribute("data-x"));
    text.setAttribute("y", text.getAttribute("data-y"));
    element.setAttribute("data-style", element.getAttribute("style"));
    element.removeAttribute("style");
  });

  const string = new XMLSerializer().serializeToString(svg);

  modules.forEach((element) => {
    element.removeAttribute("x");
    element.removeAttribute("y");
    element.setAttribute("style", element.getAttribute("data-style"));
    element.removeAttribute("data-style");
  });

  offsets.forEach((element) => {
    element.removeAttribute("transform");
    element.setAttribute("data-style", element.getAttribute("style"));
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
