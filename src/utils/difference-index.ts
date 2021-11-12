export default function differenceIndex(array1: number[], array2: number[]) {
  const minLength = Math.min(array1.length, array2.length);
  for (let i = 0; i < minLength; i++) {
    if (array1[i] !== array2[i]) return i;
  }
  return 0;
}
