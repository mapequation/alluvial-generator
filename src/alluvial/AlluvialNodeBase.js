// @flow
type Position = {
    x: number,
    y: number,
};

type Size = {
    width: number,
    height: number,
};

type Layout = Position & Size;

export type AlluvialNode = $Subtype<AlluvialNodeBase>;

export default class AlluvialNodeBase {
    flow: number = 0;
    networkIndex: number;
    id: string;

    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;

    +children: AlluvialNode[] = [];
    parent: ?AlluvialNode = null;

    constructor(networkIndex: number, parent: ?AlluvialNode = null, id: string = "") {
        this.networkIndex = networkIndex;
        this.parent = parent;
        this.id = id;
    }

    get depth(): number {
        return 0;
    }

    get isEmpty(): boolean {
        return this.children.length === 0;
    }

    addChild(node: AlluvialNode) {
        this.children.push(node);
    }

    removeChild(node: AlluvialNode) {
        const index = this.children.indexOf(node);
        const found = index > -1;
        if (found) {
            this.children.splice(index, 1);
        }
        return found;
    }

    asObject(): Object {
        return {
            id: this.id,
            flow: this.flow,
            depth: this.depth,
            layout: this.layout,
            children: this.children.map(child => child.asObject()),
        };
    }

    set layout({ x, y, width, height }: Layout) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get layout(): Layout {
        const { x, y, width, height } = this;
        return { x, y, width, height };
    }

    get byFlow() {
        return -this.flow;
    }
}
