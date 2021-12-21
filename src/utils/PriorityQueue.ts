export default class PriorityQueue<T extends { flow: number }> {
  heap: T[] = [];

  constructor(public numValues: number, values: Iterable<T> = []) {
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
    } else if (value.flow > this.minValue.flow) {
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

  private sort() {
    this.heap.sort((a, b) => b.flow - a.flow);
  }
}
