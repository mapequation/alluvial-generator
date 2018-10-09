// @flow

export default class AlluvialNodeBase {
    flow: number = 0;
    networkIndex: number;
    id: string;

    constructor(networkIndex: number, id: string = "") {
        this.networkIndex = networkIndex;
        this.id = id;
    }
}
