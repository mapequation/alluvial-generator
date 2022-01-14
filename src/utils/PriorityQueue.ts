type CompareFn<T> = (a: T, b: T) => number;

export default class PriorityQueue<T = number> {
  private heap: T[] = [];

  constructor(
    public numValues: number,
    private compareFn: CompareFn<T>,
    values: Iterable<T> = []
  ) {
    for (const value of values) {
      this.push(value);
    }
  }

  get length() {
    return this.heap.length;
  }

  private get minValue() {
    return this.heap[this.heap.length - 1];
  }

  push(value: T) {
    if (this.length < this.numValues) {
      this.heap.push(value);
      this.sort();
    } else if (this.compareFn(value, this.minValue) < 0) {
      this.heap.push(value);
      this.sort();
      if (this.length > this.numValues) {
        this.heap.pop();
      }
    }
  }

  map(callbackFn: Parameters<T[]["map"]>[0]) {
    return this.heap.map(callbackFn);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.heap[Symbol.iterator]();
  }

  toArray() {
    return this.heap;
  }

  private sort() {
    this.heap.sort(this.compareFn);
  }
}
