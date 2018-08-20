export const pairwise = (arr, callback) => {
    for (let i = 0; i < arr.length - 1; i++) {
        callback(arr[i], arr[i + 1], i, arr);
    }
};
