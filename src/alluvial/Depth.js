// @flow
export type Depth = number;

export const ALLUVIAL_ROOT: Depth = 0;
export const NETWORK_ROOT: Depth = 1;
export const MODULE: Depth = 2;
export const HIGHLIGHT_GROUP: Depth = 3;
export const BRANCH: Depth = 4;
export const STREAMLINE_NODE: Depth = 5;
export const LEAF_NODE: Depth = 6;

export default {
  ALLUVIAL_ROOT,
  NETWORK_ROOT,
  MODULE,
  HIGHLIGHT_GROUP,
  BRANCH,
  STREAMLINE_NODE,
  LEAF_NODE
};
