import type { NetworkFile, Node } from "../types";
import { calcStatistics } from "./calc-statistics";
import { setIdentifiers } from "./set-identifiers";

export function createFilesFromDiagramObject(
  json: any, // FIXME any
  file: File
): NetworkFile[] {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network: { nodes: Node[] }) => network.nodes.length)
      .reduce((tot: any, b: any) => tot + b, 0) || 1;

  return json.networks.map((network: { nodes: Node[] }) => {
    setIdentifiers(network.nodes, "json");

    return {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      filename: file.name,
      // name: network.name, // FIXME remove
      // id: network.id, // FIXME
      haveModules: true,
      format: "json",
      ...calcStatistics(network.nodes),
      ...network,
    };
  });
}
