import { ACCUMULATE, COORDINATES, ECHO } from "./actions";
import diagram from "../models/diagram";
import accumulateModuleFlow from "../models/accumulate-module-flow";


const log = message => console.log(`[Worker] ${message}`);

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
            postMessage(accumulateModuleFlow(sourceNodes, targetNodes));
            break;
        case COORDINATES:
            postMessage(diagram(data.props));
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
