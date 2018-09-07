const workerPromise = worker => message =>
    new Promise(resolve => {
        worker.postMessage(message);
        worker.onmessage = event => resolve(event.data);
    });

export default workerPromise;
