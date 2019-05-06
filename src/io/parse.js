// @flow
import id from "../lib/id";


export default function parse(object: Object, name: string): Network {
  return {
    ...object,
    id: id(),
    name,
  };
}
