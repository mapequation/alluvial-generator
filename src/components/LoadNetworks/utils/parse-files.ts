import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap-parser";
import JSZip from "jszip";
import { Identifier } from "../../../alluvial";
import id from "../../../utils/id";
import type { Format, NetworkFile } from "../types";
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";

type ErrorType = {
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
    const fileContents = readFiles[i];
    const format = fileExtension(file.name) as Format | undefined;

    if (!format) {
      errors.push(createError(file, "invalid-format", "No format found"));
      continue;
    }

    let parsedFile: any;

    if (format === "json") {
      try {
        parsedFile = JSON.parse(fileContents);
      } catch (e: any) {
        errors.push(createError(file, "invalid-json", e.message));
        continue;
      }
    } else if (format === "net") {
      parsedFile = {
        network: fileContents,
        haveModules: false,
      };
    } else {
      try {
        parsedFile = parse(fileContents, undefined, true, false);
      } catch (e: any) {
        errors.push(createError(file, "parse-error", e.message));
        continue;
      }
    }

    if (!parsedFile) {
      errors.push(createError(file, "invalid-format", "Could not parse file"));
      continue;
    }

    try {
      setIdentifiers(parsedFile.nodes, format, identifier);
      newFiles.push(createFile(file, format, parsedFile));
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

export function createFile(
  file: File,
  format: Format,
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
