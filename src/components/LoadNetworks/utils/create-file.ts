import id from "../../../utils/id";
import { NetworkFile } from "../types";
import { calcStatistics } from "./calc-statistics";

export function createFile(
  file: File,
  format: string,
  contents: any // FIXME any
): NetworkFile {
  const newFile = Object.assign(
    {},
    {
      ...file,
      filename: file.name, // Save the original filename so we don't overwrite it
      name: file.name,
      lastModified: file.lastModified,
      size: file.size,
      id: id(),
      haveModules: true,
      format,
      ...contents,
    }
  );

  if (newFile.haveModules) {
    Object.assign(newFile, calcStatistics(newFile.nodes));
  }

  return newFile;
}
