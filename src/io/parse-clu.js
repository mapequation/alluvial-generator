// @flow
import id from "../lib/id";
import type { NetworkData } from "./network-types";


export default function parseClu(object: Object): NetworkData {
  return {
    data: {
      nodes: object.nodes.map(node => ({ path: node.cluster.toString(), ...node })),
      meta: {
        id: id(),
      },
    },
  };
}
