import FileSaver from "file-saver";
import readAsText from "./read-as-text";


export const serializeState = (state, filename) => {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, filename);
};

export const parseState = async (file) => {
  if (!file) {
    return;
  }

  const json = await readAsText(file);
  return JSON.parse(json);
};
