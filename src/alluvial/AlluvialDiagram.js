// @flow
import { pairs } from "d3";
import type { FTree } from "../io/parse-ftree";
import AlluvialRoot from "./AlluvialRoot";


export default class AlluvialDiagram {
    roots: AlluvialRoot[];

    constructor(networks: FTree[]) {
        this.roots = networks.map(network => new AlluvialRoot(network));

        pairs(this.roots).forEach(([left, right]) => left.setRight(right));
    }
}
