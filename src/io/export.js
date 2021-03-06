import FileSaver from "file-saver";


export const saveSvg = (elementId, filename) => {
  const svg = document.getElementById(elementId);
  const string = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([string], { type: "image/svg+xml;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
};

export const savePng = (elementId, filename) => {
  const svg = document.getElementById(elementId);
  const { width, height } = svg.getBoundingClientRect();

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  const string = new XMLSerializer().serializeToString(svg);
  svg.removeAttribute("width");
  svg.removeAttribute("height");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  const image = new Image(width, height);
  image.onload = () => {
    context.drawImage(image, 0, 0);
    canvas.toBlob(blob => FileSaver.saveAs(blob, filename));
  };

  image.onerror = (err) => {
    console.error(err.type, err.message);
  };

  image.src = "data:image/svg+xml; charset=utf8, " + encodeURIComponent(string);
};

export const saveDiagram = (version, networks, alluvialRoot, state = {}) => {
  const filename = networks.map(network => network.name).join(",") + ".json";

  const networkRoot = id => {
    const networkRoot = alluvialRoot.getNetworkRoot(id);
    if (!networkRoot) {
      console.error(`No network found with id ${id}`);
      return;
    }
    return networkRoot;
  };

  const nodes = id => {
    const root = networkRoot(id);
    return root ? Array.from(root.leafNodes()).map(node => node.toNode()) : null;
  };

  const name = id => {
    const root = networkRoot(id);
    return root ? root.name : null;
  };

  const moduleNames = id => {
    const root = networkRoot(id);
    return root ? root.getModuleNames() : [];
  };

  const json = JSON.stringify({
    version,
    timestamp: +new Date(),
    state,
    networks: networks.map(network => ({
      id: network.id,
      name: name(network.id) || network.name,
      codelength: network.codelength,
      moduleNames: moduleNames(network.id),
      nodes: nodes(network.id) || []
    }))
  }, null, 2);

  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
};
