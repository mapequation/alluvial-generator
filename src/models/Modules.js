export default class Modules {
    constructor(modules, maxTotalFlow, style) {
        this.modules = modules;
        this.maxTotalFlow = maxTotalFlow;
        this.style = style;
        this.xOffset = 0;
    }

    get rightSide() {
        return this.xOffset + this.style.barWidth;
    }

    moveToRightOf(leftModules) {
        const { barWidth, streamlineWidth } = this.style;
        this.xOffset += leftModules.xOffset + barWidth + streamlineWidth;
    }

    get data() {
        const { height, padding } = this.style;
        return this._modulesWithHeightY(this.modules, this.maxTotalFlow, height, padding);
    }

    _modulesWithHeightY(modules, totalFlow, totalHeight, padding, minHeight = 0.1) {
        let accumulatedHeight = totalHeight; // starting from the bottom, so we subtract from this

        const visibleModules = modules.filter(module =>
            this._moduleHeight(module.flow, padding, modules.length, totalHeight, totalFlow) > minHeight);

        return visibleModules
            .map(module => {
                const height = this._moduleHeight(module.flow, padding, visibleModules.length, totalHeight, totalFlow);
                const y = accumulatedHeight - height;
                accumulatedHeight -= height + padding;
                return {
                    width: this.style.barWidth,
                    height,
                    x: this.xOffset,
                    y,
                    ...module,
                };
            });
    }

    _moduleHeight(flow, padding, numModules, totalHeight, totalFlow) {
        const totalPadding = padding * (numModules - 1);
        const usableHeight = totalHeight - totalPadding;
        return flow / totalFlow * usableHeight;
    }
}
