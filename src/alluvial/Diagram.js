// @flow
import { pairs } from "d3";
import type { FTree } from "../io/parse-ftree";
import Root from "./Root";


export default class Diagram {
    roots: Root[];

    constructor(networks: FTree[]) {
        this.roots = networks.map(network => new Root(network));

        pairs(this.roots).forEach(([left, right]) => left.setRight(right));
    }
}
