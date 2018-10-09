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

export default class AlluvialNodeBase {
    flow: number = 0;
    networkIndex: number;
    id: string;

    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;

    constructor(networkIndex: number, id: string = "") {
        this.networkIndex = networkIndex;
        this.id = id;
    }

    get depth(): number {
        return 0;
    }

    asObject(): Object {
        return {};
    }

    set position([x, y]: Position): void {
        this.x = x;
        this.y = y;
    }

    set size({ width, height }: Size): void {
        this.width = width;
        this.height = height;
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
}
