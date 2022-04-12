// @ts-nocheck
import TreePath from "../../../utils/TreePath";

const stateOrNodeId = (node) => (node.stateId != null ? node.stateId : node.id);

export function setIdentifiers(network, format: string, identifier = "id") {
  const { nodes } = network;

  const getIdentifier = (node) => {
    if (identifier === "id") {
      return stateOrNodeId(node).toString();
    } else if (identifier === "name") {
      return node.name ?? stateOrNodeId(node).toString();
    }
  };

  if (format === "multilayer-expanded") {
    // Expanded multilayer networks must use the physical
    // node id, as the state ids are unique per layer.
    nodes.forEach((node) => (node.identifier = node.id.toString()));
  } else if (format === "json") {
    nodes.forEach((node) => {
      node.identifier = node.identifier ?? getIdentifier(node);
      // TODO: remove. Used only for example data.
      if (!Array.isArray(node.path)) {
        node.path = TreePath.toArray(node.path);
      }
    });
  } else if (format === "tree" || format === "ftree" || format === "stree") {
    nodes.forEach((node) => (node.identifier = getIdentifier(node)));
  } else if (format === "clu") {
    nodes.forEach((node) => {
      const id = stateOrNodeId(node);
      node.path = node.moduleId.toString();
      node.identifier = id.toString();
      node.name = node.id.toString();
    });
  }
}
