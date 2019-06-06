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
  const string = new XMLSerializer().serializeToString(svg);

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
