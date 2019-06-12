// @flow
declare type Predicate<T> = (T) => boolean;

declare interface Node {
  +path: string;
  +flow: number;
  +name: string;
  +id?: number;
  +stateId?: number;
  +insignificant?: boolean;
  +highlightIndex?: number;
  +moduleLevel?: number;
}

declare interface Network {
  +nodes: Node[];
  +id: string;
  +codelength: number;
  +name: string;
  +moduleNames: ?Array<[string, Object]>;
}
