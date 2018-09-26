// @flow
import { pairs } from "d3";
import type { FTree } from "../io/parse-ftree";
import AlluvialModule from "./AlluvialModule";


export default class AlluvialDiagram {
    networks: FTree[];
    roots: AlluvialModule[];

    constructor(networks: FTree[]) {
        this.networks = networks;

        this.roots = networks.map(n => {
            const rootModule = n.data.modules.find(m => m.path === "root");

            if (!rootModule) throw new Error("Found no root module in network!");

            return new AlluvialModule(
                rootModule,
                n.data.modules.filter(m => m.path !== "root"),
                n.data.nodes);
        });

        pairs(this.roots).forEach(([left, right]) => {
            left.setRight(right);
            right.setLeft(left);
        });
    }
}
