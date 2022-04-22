import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap-parser";
import JSZip from "jszip";
import { Identifier } from "../../../alluvial";
import id from "../../../utils/id";
import type { Format, NetworkFile } from "../types";
import { createFile } from "./create-file";
import { createFilesFromDiagramObject } from "./from-diagram";
import { setIdentifiers } from "./set-identifiers";

export type ErrorType = {
  file: File;
  errors: { code: string; message: string }[];
};

function createError(file: File, code: string, message: string): ErrorType {
  return {
    file,
    errors: [{ code, message }],
  };
}

export async function parseAcceptedFiles(
  acceptedFiles: File[],
  currentFiles: NetworkFile[],
  acceptedFormats: readonly string[],
  identifier: Identifier
): Promise<[NetworkFile[], ErrorType[]]> {
  const { readFiles, errors } = await readAcceptedFiles(
    acceptedFiles,
    acceptedFormats
  );

  const newFiles = [];

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
        haveModules: false,
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
      setIdentifiers(contents.nodes, format as Format, identifier);
      newFiles.push(createFile(file, format, contents));
    } catch (e: any) {
      errors.push(createError(file, "invalid-format", e.message));
    }
  }

  return [newFiles, errors];
}

async function readAcceptedFiles(
  acceptedFiles: File[],
  acceptedFormats: readonly string[]
): Promise<{ readFiles: string[]; errors: ErrorType[] }> {
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
                { name } as File,
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
          } as File);
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

  return { readFiles, errors };
}
