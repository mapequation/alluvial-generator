import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap-parser";
import JSZip from "jszip";
import { Identifier } from "../alluvial";
import id from "../utils/id";
import type { Format, NetworkFile } from "./types";
import { sortBySavedPosition } from "./alluvial-format";
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";
import { validateNetworkNodes } from "./validate-nodes";

// File extensions parseAcceptedFiles can read (lower case).
const FILE_FORMATS: readonly Format[] = [
  "json",
  "clu",
  "tree",
  "ftree",
  "stree",
  "net",
];

// MIME types browsers report for a zip archive (Chrome on Windows sends
// application/x-zip-compressed).
const ZIP_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
];

/** The lower-cased extension of a file name ("" if there is none). */
function lowerExtension(name: string): string {
  return name.includes(".") ? (fileExtension(name) ?? "").toLowerCase() : "";
}

function isZip(file: File): boolean {
  return (
    ZIP_MIME_TYPES.includes(file.type) || lowerExtension(file.name) === "zip"
  );
}

// Zip entries that are not files: directories and macOS metadata.
function isZipMetadata(name: string, isDirectory: boolean): boolean {
  const base = name.split("/").pop() ?? "";
  return (
    isDirectory ||
    base === "" ||
    name.startsWith("__MACOSX/") ||
    base.startsWith("._")
  );
}

type ErrorType = {
  file: File;
  errors: { code: string; message: string }[];
  // A warning is non-fatal: the file is loaded (it is in the returned files).
  warning?: boolean;
};

function createError(file: File, code: string, message: string): ErrorType {
  return {
    file,
    errors: [{ code, message }],
  };
}

/** The identifiers shared by several nodes, in first-repeat order. */
export function duplicateIdentifiers(
  nodes: { identifier?: string }[]
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { identifier } of nodes) {
    if (identifier == null) continue;
    if (seen.has(identifier)) duplicates.add(identifier);
    seen.add(identifier);
  }
  return Array.from(duplicates);
}

/** The warning text for duplicateIdentifiers (also shown by the web app when the identifier is switched). */
export function duplicateIdentifiersMessage(duplicates: string[]): string {
  const example = duplicates
    .slice(0, 3)
    .map((id) => `"${id}"`)
    .join(", ");
  return (
    `${duplicates.length} identifier(s) are shared by several nodes ` +
    `(e.g. ${example}); only the last node with each identifier ` +
    `is matched across networks`
  );
}

function duplicateIdentifiersWarning(
  file: File,
  duplicates: string[]
): ErrorType {
  return {
    ...createError(
      file,
      "duplicate-identifiers",
      duplicateIdentifiersMessage(duplicates)
    ),
    warning: true,
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
    const extension = lowerExtension(file.name);

    if (!extension) {
      errors.push(createError(file, "invalid-format", "No format found"));
      continue;
    }

    if (
      !FILE_FORMATS.includes(extension as Format) ||
      !acceptedFormats.includes(extension)
    ) {
      errors.push(
        createError(
          file,
          "invalid-format",
          `Unsupported file format: ${extension}`
        )
      );
      continue;
    }

    const format = extension as Format;

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
      // A .net file has no nodes until Infomap has run on it.
      if (format !== "net") validateNetworkNodes(parsedFile.nodes);
      newFiles.push(createFile(file, format, parsedFile));
      if (format !== "net") {
        const duplicates = duplicateIdentifiers(parsedFile.nodes);
        if (duplicates.length) {
          errors.push(duplicateIdentifiersWarning(file, duplicates));
        }
      }
    } catch (e: any) {
      errors.push(createError(file, "invalid-format", e.message));
    }
  }

  // The files of one saved diagram load in saved order, however they were
  // dropped.
  return [sortBySavedPosition(newFiles), errors];
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
    if (isZip(file)) {
      try {
        // Remove the zipped file from the list of files
        acceptedFiles.splice(fileIndex, 1);

        const zipFile = await JSZip.loadAsync(file);

        for (const [name, compressedFile] of Object.entries(zipFile.files)) {
          if (isZipMetadata(name, compressedFile.dir)) continue;

          const extension = lowerExtension(name);

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
