const parsePromise = (file, opts) =>
    new Promise((complete, error) =>
        Papa.parse(file, Object.assign(opts, { complete, error }))); // eslint-disable-line no-undef

export default parsePromise;
