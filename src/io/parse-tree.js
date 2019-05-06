// @flow
import id from "../lib/id";


export default function parseTree(object: Object, name: string): Network {
  return {
    ...object,
    id: id(),
    name,
  };
}
