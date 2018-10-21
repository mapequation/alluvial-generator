// @flow
declare type Predicate<T> = (T) => boolean;

declare interface Node {
  +path: string;
  +flow: number;
  +name: string;
  +node: number;
  +stateNode?: number;
  +insignificant?: boolean;
  +highlightIndex?: number;
}

declare interface Network {
  +nodes: Node[];
  +id: string;
}
