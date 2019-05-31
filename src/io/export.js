import FileSaver from "file-saver";


export const saveSvg = (elementId, filename) => {
  const svgEl = document.getElementById(elementId);
  const svg = new XMLSerializer().serializeToString(svgEl);
  const preface = "<?xml version=\"1.0\" standalone=\"no\"?>\r\n";
  const svgBlob = new Blob([preface, svg], { type: "image/svg+xml;charset=utf-8" });
  FileSaver.saveAs(svgBlob, filename);
};

export const savePng = (elementId, filename) => {
  const [width, height] = [window.innerWidth, window.innerHeight];

  const svgEl = document.getElementById(elementId);
  svgEl.setAttribute("width", width);
  svgEl.setAttribute("height", height);
  const svg = new XMLSerializer().serializeToString(svgEl);
  svgEl.removeAttribute("width");
  svgEl.removeAttribute("height");

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

  image.src = "data:image/svg+xml; charset=utf8, " + encodeURIComponent(svg);
};
