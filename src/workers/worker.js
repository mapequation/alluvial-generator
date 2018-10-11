import { ECHO } from "./actions";


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
        case ECHO:
            const { type, ...rest } = data;
            console.log(rest);
            break;
        default:
            log("Unknown event");
            break;
    }
};
