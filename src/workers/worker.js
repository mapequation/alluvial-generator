import TreePath from "../lib/treepath";
import { map } from "d3";
import { ACCUMULATE, ECHO } from "./actions";


const dispatch = postMessage;

const log = message => console.log(`[Worker] ${message}`);

const accumulateModuleFlows = (sourceNodes, targetNodes, parentModule = "root") => {
    const parent = new TreePath(parentModule);

    const targetNodesByName = map(targetNodes, node => node.name);

    const sourceNodesWithTarget = sourceNodes.filter(node => targetNodesByName.has(node.name));
    const sourceNodesBelowParent = sourceNodesWithTarget.filter(node => parent.isAncestor(node.path));

    const accumulationLevel = parent.level + 1;

    const moduleFlows = map();

    sourceNodesBelowParent.forEach((sourceNode) => {
        const targetNode = targetNodesByName.get(sourceNode.name);

        const sourceAncestorPath = TreePath.ancestorAtLevel(sourceNode.path, accumulationLevel);
        const targetAncestorPath = TreePath.ancestorAtLevel(targetNode.path, accumulationLevel);

        const key = TreePath.join(sourceAncestorPath, targetAncestorPath);
        const found = moduleFlows.get(key);

        if (found) {
            found.sourceFlow += sourceNode.flow;
            found.targetFlow += targetNode.flow;
            found.accumulatedNodes++;
        } else if (sourceNode.flow > 0 && targetNode.flow > 0) {
            moduleFlows.set(key, {
                sourcePath: sourceAncestorPath.path,
                targetPath: targetAncestorPath.path,
                sourceFlow: sourceNode.flow,
                targetFlow: targetNode.flow,
                accumulatedNodes: 1,
            });
        }
    });

    return moduleFlows.values();
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
