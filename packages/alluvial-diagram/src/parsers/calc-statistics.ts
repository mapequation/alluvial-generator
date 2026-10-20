export function calcStatistics(
  nodes: {
    path: string | number[];
    flow?: number;
    stateId?: number;
    layerId?: number;
  }[]
) {
  const flowDistribution: { [key: number]: number } = {};
  const layerIds = new Set();
  const topModules = new Set();
  let numLevels = 0;

  nodes.forEach((node) => {
    const path = Array.isArray(node.path) ? node.path : splitPath(node.path);
    const topModule = Number(path[0]);
    topModules.add(topModule);
    numLevels = Math.max(numLevels, path.length);

    if (!flowDistribution[topModule]) {
      flowDistribution[topModule] = 0;
    }
    flowDistribution[topModule] += node.flow ?? 0;

    if (node.layerId !== undefined) {
      layerIds.add(node.layerId);
    }
  });

  const isMultilayer = nodes?.[0]["layerId"] !== undefined;
  const isStateNetwork = nodes?.[0]["stateId"] !== undefined;
  const numLayers = layerIds.size > 0 ? layerIds.size : undefined;

  return {
    flowDistribution,
    isMultilayer,
    isStateNetwork,
    isExpanded: isMultilayer ? false : undefined,
    numLayers,
    numTopModules: topModules.size,
    numLevels,
  };
}

/**
 * Split a path string on ":", without the empty last segment
 * of stree paths ("1:1:1:"), as TreePath does.
 */
function splitPath(path: string | undefined) {
  const parts = path?.split(":") ?? [];
  if (parts.length > 1 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}
