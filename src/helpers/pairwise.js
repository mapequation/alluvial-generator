export const pairwise = (arr, callback) => {
    const result = [];
    for (let i = 0; i < arr.length - 1; i++) {
        result.push(callback(arr[i], arr[i + 1], i, i + 1, arr));
    }
    return result;
};

export const pairwiseEach = (arr, callback) => {
    for (let i = 0; i < arr.length - 1; i++) {
        callback(arr[i], arr[i + 1], i, i + 1, arr);
    }
};

export default pairwise;
