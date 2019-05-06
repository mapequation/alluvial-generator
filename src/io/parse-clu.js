// @flow
import id from "../lib/id";


export default function parseClu(object: Object, name: string): Network {
  return {
    nodes: object.nodes.map(node => ({ path: node.cluster.toString(), ...node })),
    id: id(),
    codelength: object.codelength,
    name,
  };
}
