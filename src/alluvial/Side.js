export type Side = -1 | 1;

export const LEFT: Side = -1;
export const RIGHT: Side = 1;

export const sideToString = (side: Side): string => side === LEFT ? "left" : "right";

export const opposite = (side: Side): Side => -side;
