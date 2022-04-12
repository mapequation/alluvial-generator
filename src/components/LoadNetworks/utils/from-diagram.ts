// @ts-nocheck
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";

export function createFilesFromDiagramObject(
  json: any, // FIXME any
  file: any // FIXME any
) {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network) => network.nodes.length)
      .reduce((tot, b) => tot + b, 0) || 1;

  return json.networks.map((network) => {
    setIdentifiers(network, "json");

    return {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      fileName: file.name,
      name: network.name, // FIXME remove
      id: network.id, // FIXME remove
      format: "json",
      ...calcStatistics(network),
      ...network,
    };
  });
}
