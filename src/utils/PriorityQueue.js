export default class PriorityQueue {
  heap = [];
  numValues;

  constructor(numValues) {
    this.numValues = numValues;
  }

  get length() {
    return this.heap.length;
  }

  get minValue() {
    return this.heap[this.heap.length - 1];
  }

  sort() {
    this.heap.sort((a, b) => b.flow - a.flow);
  }

  push(value) {
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

  map(callbackFn) {
    return this.heap.map(callbackFn);
  }
}
