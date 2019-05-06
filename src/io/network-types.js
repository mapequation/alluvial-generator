// @flow
export type Node = {
  +path: string,
  +flow: number,
  +name: string,
  +id?: number,
  +stateId?: number
};

export type NetworkData = {
  +data: {
    +nodes: Node[],
    +meta: {
      id: string,
      codelength: number
    }
  }
};
