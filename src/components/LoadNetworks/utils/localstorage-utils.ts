// @ts-nocheck
import localforage from "localforage";

export async function getLocalStorageFiles() {
  const network = await localforage.getItem("network");
  if (!network) return [];

  const localStorageFiles = [];

  const acceptedKeys = [
    "ftree",
    "ftree_states",
    "clu",
    "clu_states",
    "json",
    "json_states",
  ];
  const extensions = {
    ftree: ".ftree",
    ftree_states: "_states.ftree",
    clu: ".clu",
    clu_states: "_states.clu",
    json: ".json",
    json_states: "_states.json",
  };

  for (let key of Object.keys(network)) {
    if (
      key === "timestamp" ||
      key === "name" ||
      key === "input" ||
      !acceptedKeys.includes(key) ||
      !network[key]
    ) {
      continue;
    }

    const contents =
      key === "json" || key === "json_states"
        ? JSON.stringify(network[key]) // TODO dan't stringify and then parse again
        : network[key];
    const extension = extensions[key];
    const filename = `${network.name ?? "network"}${extension}`;

    const blob = new Blob([contents], { type: "text/plain" });
    const file = new File([blob], filename, {
      type: "text/plain",
      lastModified: network.timestamp,
    });

    localStorageFiles.push(file);
  }

  return localStorageFiles;
}
