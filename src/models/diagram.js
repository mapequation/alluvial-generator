import { pairs } from "d3";

import Modules from "./Modules";
import StreamLines from "./StreamLines";
import TreePath from "../lib/treepath";


const largestModulesBelowParent = (modules, numModules, parent) =>
    modules
        .filter(m => !TreePath.isRoot(m.path))
        .filter(m => parent.isParentOf(m.path))
        .filter(m => m.flow > 0)
        .sort((a, b) => b.flow - a.flow)
        .slice(0, numModules);

const calcMaxTotalFlow = modules => modules
    .map(module => module
        .map(module => module.flow)
        .reduce((tot, curr) => tot + curr, 0))
    .reduce((max, curr) => Math.max(max, curr), -Infinity);

const calcBarWidth = (numModules, totalWidth, streamlineFraction) => {
    const numStreamlines = numModules - 1;
    return totalWidth / (numModules + numStreamlines * streamlineFraction);
};

export default function diagram(props) {
    const { width, height, padding, streamlineFraction, numModules, streamlineThreshold, networks, parentModule, moduleFlows } = props;

    const parent = new TreePath(parentModule);

    const largestModules = networks.map(n => largestModulesBelowParent(n.data.modules, numModules, parent));

    const maxTotalFlow = calcMaxTotalFlow(largestModules);

    const barWidth = calcBarWidth(networks.length, width, streamlineFraction);
    const streamlineWidth = streamlineFraction * barWidth;

    const modules = largestModules.map(modules =>
        new Modules(modules, maxTotalFlow, { barWidth, height, padding, streamlineWidth }));

    const modulePairs = pairs(modules);

    modulePairs.forEach(([left, right]) => right.moveToRightOf(left));

    const streamlines = modulePairs.map(([leftModules, rightModules], i) =>
        new StreamLines(leftModules, rightModules, moduleFlows[i][parent.level + 1], streamlineThreshold, streamlineWidth));

    return {
        modules: modules.map(m => m.data),
        streamlines: streamlines.map(s => s.data),
    };
}
