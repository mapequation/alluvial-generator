// @flow
export type Row = string[];

export type Node = {
  +path: string,
  +flow: number,
  +name: string,
  +node?: number,
  +stateNode?: number
};

export type Link = {
  +source: number,
  +target: number,
  +flow: number
};

export type Module = {
  +path: string,
  +exitFlow: number,
  +numEdges: number,
  +numChildren: number,
  +flow: number,
  +name: string,
  +links: Link[]
};
