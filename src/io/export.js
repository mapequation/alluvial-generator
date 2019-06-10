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
  const obj = {
    version,
    timestamp: +new Date(),
    state,
    alluvialRoot,
    networks
  };
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
};
