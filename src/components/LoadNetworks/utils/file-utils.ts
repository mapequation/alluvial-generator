// @ts-nocheck
// FIXME enable typescript checking
import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap-parser";
import JSZip from "jszip";
import id from "../../../utils/id";
import { calcStatistics } from "./calc-statistics";
import { createFilesFromDiagramObject } from "./from-diagram";
import { setIdentifiers } from "./set-identifiers";

// FIXME any
function createError(file: any, code: string, message: string) {
  return {
    file,
    errors: [{ code, message }],
  };
}

export async function parseAcceptedFiles(
  acceptedFiles: any[], // FIXME any
  currentFiles: any[], // FIXME any
  acceptedFormats: string[],
  storeIdentifier: string
) {
  const readFiles = [];
  const errors = [];

  const textFormats = acceptedFormats.filter((ext) => ext !== "zip");

  // Unzip compressed files, read uncompressed files
  let fileIndex = 0;
  for (const file of [...acceptedFiles]) {
    if (file?.type === "application/zip") {
      try {
        // Remove the zipped file from the list of files
        acceptedFiles.splice(fileIndex, 1);

        const zipFile = await JSZip.loadAsync(file);

        for (const [name, compressedFile] of Object.entries(zipFile.files)) {
          const extension = fileExtension(name) ?? "";

          if (!textFormats.includes(extension)) {
            errors.push(
              createError(
                { name },
                "unsupported-format",
                `Unsupported file format: ${extension}`
              )
            );
            continue;
          }

          const uncompressedFile = await compressedFile.async("string");
          readFiles.push(uncompressedFile);

          // Add the decompressed file to the list of files
          acceptedFiles.splice(fileIndex, 0, {
            name,
            // Hack to get the decompressed size. Uses private fields of the JSZip object
            // @ts-ignore
            size: compressedFile?._data?.uncompressedSize ?? file.size,
            lastModified: file.lastModified,
          });
          fileIndex++;
        }
      } catch (e: any) {
        errors.push(createError(file, "unsupported-format", e.message));
      }
    } else {
      readFiles.push(await readFile(file));
      fileIndex++;
    }
  }

  const newFiles = [];

  // FIXME any
  const createFile = (file: any, format: string, contents: any) => {
    const newFile = Object.assign(
      {},
      {
        ...file,
        fileName: file.name, // Save the original filename so we don't overwrite it
        name: file.name,
        lastModified: file.lastModified,
        size: file.size,
        id: id(),
        format,
        ...contents,
      }
    );

    // .net files has noModularResult = true by default
    // all other format lack the noModularResult property
    if (contents.noModularResult === undefined && !file.noModularResult) {
      Object.assign(newFile, calcStatistics(contents));
    }

    return newFile;
  };

  // Parse files
  for (let i = 0; i < acceptedFiles.length; ++i) {
    const file = acceptedFiles[i];
    const format = fileExtension(file.name) ?? "";

    let contents = null;

    if (format === "json") {
      try {
        contents = JSON.parse(readFiles[i]);

        if (contents.networks !== undefined) {
          // A diagram contains several networks.
          // Create a new file for each network.
          const diagramFiles = createFilesFromDiagramObject(contents, file);

          // If any file ids already exist, give a new id
          for (let existingFile of [...currentFiles, ...newFiles]) {
            for (let diagramFile of diagramFiles) {
              if (existingFile.id === diagramFile.id) {
                diagramFile.id = id();
              }
            }
          }

          newFiles.push(...diagramFiles);
          continue;
        }
      } catch (e: any) {
        errors.push(createError(file, "invalid-json", e.message));
        continue;
      }
    } else if (format === "net") {
      contents = {
        network: readFiles[i],
        noModularResult: true,
      };
    } else {
      try {
        contents = parse(readFiles[i], undefined, true, false);
      } catch (e: any) {
        errors.push(createError(file, "parse-error", e.message));
        continue;
      }
    }

    if (!contents) {
      errors.push(createError(file, "invalid-format", "Could not parse file"));
      continue;
    }

    try {
      setIdentifiers(contents, format, storeIdentifier);
      newFiles.push(createFile(file, format, contents));
    } catch (e: any) {
      errors.push(createError(file, "invalid-format", e.message));
    }
  }

  return [newFiles, errors];
}
