// @flow
import { descending, map, nest } from "d3";

import TreePath from "../lib/treepath";
import type { Node } from "../io/parse-ftree";


export type ModuleFlow = {
    sourcePath: string,
    targetPath: string,
    sourceFlow: number,
    targetFlow: number,
    accumulatedNodes?: number,
};

export type ModuleFlowsPerLevel = { [number]: ModuleFlow[] };

const accumulatorKey = (sourcePath, targetPath) => `${sourcePath}-${targetPath}`;

const createAccumulator = (accumulationLevel, accumulatedFlow) =>
    ({ sourcePath, targetPath, sourceFlow, targetFlow, accumulatedNodes = 1 }: ModuleFlow) => {
        const sourceAncestorPath = TreePath.ancestorAtLevel(sourcePath, accumulationLevel);
        const targetAncestorPath = TreePath.ancestorAtLevel(targetPath, accumulationLevel);

        const key = accumulatorKey(sourceAncestorPath, targetAncestorPath);
        const found = accumulatedFlow.get(key);

        if (found) {
            found.sourceFlow += sourceFlow;
            found.targetFlow += targetFlow;
            found.accumulatedNodes += accumulatedNodes;
        } else if (sourceFlow > 0 && targetFlow > 0) {
            accumulatedFlow.set(key, {
                sourcePath: sourceAncestorPath.path,
                targetPath: targetAncestorPath.path,
                sourceFlow: sourceFlow,
                targetFlow: targetFlow,
                accumulatedNodes: accumulatedNodes,
            });
        }
    };

const accumulateModuleFlow = (sourceNodes: Node[], targetNodes: Node[]): ModuleFlowsPerLevel => {
    const targetNodesByName = map(targetNodes, node => node.name);

    const sourceNodesWithTarget = sourceNodes.filter(node => targetNodesByName.has(node.name));

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

    const accumulatedFlowPerLevel: ModuleFlowsPerLevel = {};

    for (const { key: nodeLevel, values: sourceNodes } of sourceNodesByLevel) {
        const accumulationLevel = nodeLevel - 1;
        const accumulatedFlow = map();
        const accumulate = createAccumulator(accumulationLevel, accumulatedFlow);

        sourceNodes.forEach(sourceNode => {
            const targetNode = targetNodesByName.get(sourceNode.name);
            accumulate({
                sourcePath: sourceNode.path,
                targetPath: targetNode.path,
                sourceFlow: sourceNode.flow,
                targetFlow: targetNode.flow,
            });
        });

        const previouslyAccumulated = accumulatedFlowPerLevel[nodeLevel];

        if (previouslyAccumulated) {
            previouslyAccumulated.forEach(accumulate);
        }

        accumulatedFlowPerLevel[accumulationLevel] = accumulatedFlow.values()
            .sort((a, b) => b.sourceFlow + b.targetFlow - a.sourceFlow - a.targetFlow);
    }

    return accumulatedFlowPerLevel;
};

export default accumulateModuleFlow;
