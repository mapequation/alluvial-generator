import { descending, map, nest } from "d3";

import TreePath from "../lib/treepath";
import { ACCUMULATE, ECHO } from "./actions";


const dispatch = postMessage;

const log = message => console.log(`[Worker] ${message}`);

const accumulateModuleFlows = (sourceNodes, targetNodes) => {
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

        sourceNodes.forEach(sourceNode => {
            const targetNode = targetNodesByName.get(sourceNode.name);

            const sourceAncestorPath = TreePath.ancestorAtLevel(sourceNode.path, accumulationLevel);
            const targetAncestorPath = TreePath.ancestorAtLevel(targetNode.path, accumulationLevel);

            const key = TreePath.join(sourceAncestorPath, targetAncestorPath);
            const found = accumulatedFlow.get(key);

            if (found) {
                found.sourceFlow += sourceNode.flow;
                found.targetFlow += targetNode.flow;
                found.accumulatedNodes++;
            } else if (sourceNode.flow > 0 && targetNode.flow > 0) {
                accumulatedFlow.set(key, {
                    sourcePath: sourceAncestorPath.path,
                    targetPath: targetAncestorPath.path,
                    sourceFlow: sourceNode.flow,
                    targetFlow: targetNode.flow,
                    accumulatedNodes: 1,
                });
            }
        });

        const subModules = accumulatedFlowPerLevel[nodeLevel];

        if (subModules) {
            subModules.forEach(({ sourcePath, targetPath, sourceFlow, targetFlow, accumulatedNodes }) => {
                const sourceAncestorPath = TreePath.ancestorAtLevel(sourcePath, accumulationLevel);
                const targetAncestorPath = TreePath.ancestorAtLevel(targetPath, accumulationLevel);

                const key = TreePath.join(sourceAncestorPath, targetAncestorPath);
                const found = accumulatedFlow.get(key);

                if (found) {
                    found.sourceFlow += sourceFlow;
                    found.targetFlow += targetFlow;
                    found.accumulatedNodes += accumulatedNodes;
                } else {
                    accumulatedFlow.set(key, {
                        sourcePath: sourceAncestorPath.path,
                        targetPath: targetAncestorPath.path,
                        sourceFlow,
                        targetFlow,
                        accumulatedNodes: accumulatedNodes,
                    });
                }
            });
        }

        accumulatedFlowPerLevel[accumulationLevel] = accumulatedFlow.values()
            .sort((a, b) => b.sourceFlow + b.targetFlow - a.sourceFlow - a.targetFlow);
    }

    return accumulatedFlowPerLevel;
};

onmessage = function onMessage(event) {
    const { data } = event;
    const { type } = data;

    if (!type) {
        log("Field 'type' missing");
        return;
    }

    log(`Got event ${type}`);

    switch (data.type) {
        case ACCUMULATE:
            const { sourceNodes, targetNodes } = data;
            const result = accumulateModuleFlows(sourceNodes, targetNodes);
            dispatch(result);
            break;
        case ECHO:
            const { type, ...rest } = data;
            console.log(rest);
            break;
        default:
            log("Unknown event");
            break;
    }
};
