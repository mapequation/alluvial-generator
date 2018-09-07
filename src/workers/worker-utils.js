import Worker from "worker-loader!./worker.js"; // eslint-disable-line

export const createWorker = () => new Worker();

export const workerPromise = worker => message =>
    new Promise(resolve => {
        worker.postMessage(message);
        worker.onmessage = event => resolve(event.data);
    });
