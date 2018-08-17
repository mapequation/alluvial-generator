export default class Modules {
    constructor(network, numModules, maxTotalFlow, style) {
        this.network = network;
        this.numModules = numModules;
        this.maxTotalFlow = maxTotalFlow;
        this.style = style;
        this.xOffset = 0;
    }

    x = () => this.xOffset;
    y = d => d.y;
    width = () => this.style.barWidth;
    height = d => d.height;

    offsetOf(leftModules) {
        const { barWidth, streamlineWidth } = this.style;
        this.xOffset += leftModules.xOffset + barWidth + streamlineWidth;
    }

    get data() {
        const { height, padding } = this.style;
        const largestModules = this.network.modules.slice(0, this.numModules);
        return this._modulesWithHeightY(largestModules, this.maxTotalFlow, height, padding);
    }

    _modulesWithHeightY(modules, totalFlow, totalHeight, padding) {
        let accumulatedHeight = totalHeight; // starting from the bottom, so we subtract from this

        return modules.map(module => {
            const height = this._moduleHeight(padding, modules.length, totalHeight, module.flow, totalFlow);
            const y = accumulatedHeight - height;
            accumulatedHeight -= height + padding;
            return { height, y, ...module };
        });
    }

    _moduleHeight(padding, numModules, totalHeight, moduleFlow, totalFlow) {
        const totalPadding = padding * (numModules - 1);
        const usableHeight = totalHeight - totalPadding;
        return moduleFlow / totalFlow * usableHeight;
    }
}
