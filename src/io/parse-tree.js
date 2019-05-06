// @flow
import id from "../lib/id";
import type { NetworkData } from "./network-types";


export default function parseTree(object: Object): NetworkData {
  return {
    data: {
      nodes: object.nodes,
      meta: {
        id: id(),
        codelength: object.codelength,
      },
    },
  };
}
