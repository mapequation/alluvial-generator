export type Side = -1 | 1;

export const LEFT: Side = -1 as const;
export const RIGHT: Side = 1 as const;

export const sideToString = (side: Side) => (side === LEFT ? "left" : "right");

export const opposite = (side: Side): Side => -side as Side;
