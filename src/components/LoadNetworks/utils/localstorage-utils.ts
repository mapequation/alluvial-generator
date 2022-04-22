import localforage from "localforage";

const acceptedKeys = [
  "ftree",
  "ftree_states",
  "clu",
  "clu_states",
  "json",
  "json_states",
] as const;

const extensions = {
  ftree: ".ftree",
  ftree_states: "_states.ftree",
  clu: ".clu",
  clu_states: "_states.clu",
  json: ".json",
  json_states: "_states.json",
} as const;

type LocalStorageContent =
  | {
      [key: string]: string;
    }
  | undefined;

export async function getLocalStorageFiles() {
  const network = (await localforage.getItem("network")) as LocalStorageContent;
  if (!network) return [];

  const localStorageFiles = [];

  for (const key of Object.keys(network)) {
    if (
      key === "timestamp" ||
      key === "name" ||
      key === "input" ||
      // @ts-ignore
      !acceptedKeys.includes(key) ||
      !network[key]
    ) {
      continue;
    }

    const contents =
      key === "json" || key === "json_states"
        ? JSON.stringify(network[key]) // TODO dan't stringify and then parse again
        : network[key];

    // @ts-ignore
    const extension = extensions[key];
    const filename = `${network.name ?? "network"}${extension}`;

    const blob = new Blob([contents], { type: "text/plain" });
    const file = new File([blob], filename, {
      type: "text/plain",
      lastModified: Number(network.timestamp),
    });

    localStorageFiles.push(file);
  }

  return localStorageFiles;
}
