import { descending, map, nest } from "d3";

import TreePath from "../lib/treepath";


const accumulate = (accumulationLevel, getAccumulatedFlow, setAccumulatedFlow) =>
    (sourcePath, targetPath, sourceFlow, targetFlow, accumulatedNodes = 1) => {
        const sourceAncestorPath = TreePath.ancestorAtLevel(sourcePath, accumulationLevel);
        const targetAncestorPath = TreePath.ancestorAtLevel(targetPath, accumulationLevel);

        const key = TreePath.join(sourceAncestorPath, targetAncestorPath);
        const found = getAccumulatedFlow(key);

        if (found) {
            found.sourceFlow += sourceFlow;
            found.targetFlow += targetFlow;
            found.accumulatedNodes += accumulatedNodes;
        } else if (sourceFlow > 0 && targetFlow > 0) {
            setAccumulatedFlow(key, {
                sourcePath: sourceAncestorPath.path,
                targetPath: targetAncestorPath.path,
                sourceFlow: sourceFlow,
                targetFlow: targetFlow,
                accumulatedNodes: accumulatedNodes,
            });
        }
    };

const accumulateModuleFlow = (sourceNodes, targetNodes) => {
    const targetNodesByName = map(targetNodes, node => node.name);

    const sourceNodesWithTarget = sourceNodes.filter(node => targetNodesByName.has(node.name));

    const accumulatedFlowPerLevel = {};

    const sourceNodesByLevel = nest()
        .key(node => TreePath.level(node.path))
        .sortKeys(descending)
        .entries(sourceNodesWithTarget);

    // sourceNodesByLevel = [{
    //     key: "4",
    //     values: [
    //         { path: "1:56:2:1", flow: 0.00000205879, name: "J BIOL EDUC", node: 2782 },
    //         { path: "1:56:2:2", flow: 0.00000272902, name: "INSTR SCI", node: 5996 },
    //         { path: "1:56:2:3", flow: 0.00000673389, name: "INT J SCI EDUC", node: 6033 },
    //         { path: "1:56:2:4", flow: 0.0000104007, name: "J LEARN SCI", node: 6258 },
    //         { path: "1:56:2:5", flow: 0.0000174735, name: "J RES SCI TEACH", node: 6346 },
    //         // more lines ...
    //     ]
    // },
    // // repeat for other levels ...
    // ]

    for (const { key: nodeLevel, values: sourceNodes } of sourceNodesByLevel) {
        const accumulationLevel = nodeLevel - 1;
        const accumulatedFlow = map();
        const accumulateToLevel = accumulate(accumulationLevel,
            accumulatedFlow.get.bind(accumulatedFlow),
            accumulatedFlow.set.bind(accumulatedFlow));

        sourceNodes.forEach(sourceNode => {
            const targetNode = targetNodesByName.get(sourceNode.name);
            accumulateToLevel(sourceNode.path, targetNode.path, sourceNode.flow, targetNode.flow);
        });

        const subModules = accumulatedFlowPerLevel[nodeLevel];

        if (subModules) {
            subModules.forEach(({ sourcePath, targetPath, sourceFlow, targetFlow, accumulatedNodes }) =>
                accumulateToLevel(sourcePath, targetPath, sourceFlow, targetFlow, accumulatedNodes));
        }

        accumulatedFlowPerLevel[accumulationLevel] = accumulatedFlow.values()
            .sort((a, b) => b.sourceFlow + b.targetFlow - a.sourceFlow - a.targetFlow);
    }

    return accumulatedFlowPerLevel;
};

export default accumulateModuleFlow;
