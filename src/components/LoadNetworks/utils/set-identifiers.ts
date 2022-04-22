import { Identifier } from "../../../alluvial";
import TreePath from "../../../utils/TreePath";
import type { Format, Node as NodeType } from "../types";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type Node = Optional<NodeType, "path" | "moduleId" | "flow">;

function stateOrNodeId(node: Node): number {
  return node.stateId != null ? node.stateId : node.id;
}

function getIdentifier(identifier: Identifier) {
  return (node: Node) => {
    if (identifier === "id") {
      return stateOrNodeId(node).toString();
    } else if (identifier === "name") {
      return node.name ?? stateOrNodeId(node).toString();
    }
  };
}

export function setIdentifiers(
  nodes: Node[],
  format: Format,
  identifier: Identifier = "id"
) {
  const id = getIdentifier(identifier);

  if (format === "multilayer-expanded") {
    // Expanded multilayer networks must use the physical
    // node id, as the state ids are unique per layer.
    nodes.forEach((node) => {
      node.identifier = node.id.toString();
    });
  } else if (format === "json") {
    nodes.forEach((node) => {
      node.identifier = node.identifier ?? id(node);
      // TODO: remove. Used only for example data.
      if (!Array.isArray(node.path)) {
        node.path = TreePath.toArray(node.path!);
      }
    });
  } else if (format === "tree" || format === "ftree" || format === "stree") {
    nodes.forEach((node) => {
      node.identifier = id(node);
    });
  } else if (format === "clu") {
    nodes.forEach((node) => {
      node.path = node.moduleId!.toString();
      node.identifier = stateOrNodeId(node).toString();
      node.name = node.id.toString();
    });
  }
}
