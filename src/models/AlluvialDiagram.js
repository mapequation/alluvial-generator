// @flow
import { pairs } from "d3";
import type { FTree } from "../io/parse-ftree";
import AlluvialModule from "./AlluvialModule";


export default class AlluvialDiagram {
    networks: FTree[];
    roots: AlluvialModule[];

    constructor(networks: FTree[]) {
        this.networks = networks;

        const rootModule = {
            path: "root",
            exitFlow: 0,
            flow: 1,
            numEdges: 0,
            numChildren: 0,
            flow: 1,
            name: "",
            links: [],
        };

        this.roots = networks.map(n =>
            new AlluvialModule(
                n.data.modules.find(m => m.path === "root") || rootModule,
                n.data.modules.filter(m => m.path !== "root"),
                n.data.nodes));

        pairs(this.roots).forEach(([left, right]) => {
            left.setRight(right);
            right.setLeft(left);
        });
    }
}
