export function normalize(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);
  return values.map((v) => v / sum);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
