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

    _modulesWithHeightY(modules, totalFlow, totalHeight, padding) {
        const totalPadding = padding * (modules.length - 1);
        const usableHeight = totalHeight - totalPadding;

        let accumulatedHeight = totalHeight; // starting from the bottom, so we subtract from this

        return modules.map(module => {
            const height = module.flow / totalFlow * usableHeight;
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
}
