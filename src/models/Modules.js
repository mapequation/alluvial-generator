// @flow
import type { Module } from "../io/parse-ftree";


export type ModuleCoordinates = Module & {
    width: number,
    height: number,
    x: number,
    y: number,
};

export default class Modules {
    modules: Module[];
    maxTotalFlow: number;
    height: number;
    padding: number;
    barWidth: number;
    streamlineWidth: number;
    xOffset: number;

    constructor(modules: Module[], maxTotalFlow: number, height: number, padding: number, barWidth: number, streamlineWidth: number) {
        this.modules = modules;
        this.maxTotalFlow = maxTotalFlow;
        this.height = height;
        this.padding = padding;
        this.barWidth = barWidth;
        this.streamlineWidth = streamlineWidth;
        this.xOffset = 0;
    }

    get rightSide(): number {
        return this.xOffset + this.barWidth;
    }

    moveToRightOf(leftModules: Modules): void {
        this.xOffset += leftModules.xOffset + this.barWidth + this.streamlineWidth;
    }

    get data(): ModuleCoordinates[] {
        let accumulatedHeight = this.height; // Starting from the bottom, so we subtract from this

        // Invisible modules introduce unwanted padding, we need to filter those.
        const visibleModules = this._visibleModules();

        let usableHeight = this._usableHeight(this.padding, this.height, visibleModules.length);

        return visibleModules
            .map(module => {
                const height = this._moduleHeight(module.flow, this.maxTotalFlow, usableHeight);
                const y = accumulatedHeight - height;
                accumulatedHeight -= height + this.padding;
                return {
                    width: this.barWidth,
                    height,
                    x: this.xOffset,
                    y,
                    ...module,
                };
            });
    }

    _visibleModules(minHeight: number = 0.1): Module[] {
        let usableHeight = this._usableHeight(this.padding, this.height, this.modules.length);
        return this.modules.filter(module =>
            this._moduleHeight(module.flow, this.maxTotalFlow, usableHeight) > minHeight);
    };

    _usableHeight = (padding: number, totalHeight: number, numModules: number) => totalHeight - padding * (numModules - 1);

    _moduleHeight = (flow: number, totalFlow: number, usableHeight: number): number => flow / totalFlow * usableHeight;
}
