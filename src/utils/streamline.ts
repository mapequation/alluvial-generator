type Position = {
  x0: number;
  y0: number;
  h0: number;
  x1: number;
  y1: number;
  h1: number;
};

/*
                  (cpx, y1) ________ (x1, y1)
                  ________/        |
 (x0, y0) ______/                  |
         |                         | h1
         |                         |
      h0 |                  _______|
         |        ________/         (x1, y1 + h1)
         |______/
 (x0, y0 + h0)    (cpx, y0 + h0)
 */
export function streamlineHorizontal() {
  const threshold = 1e-6;
  return function streamline({ x0, y0, h0, x1, y1, h1 }: Position) {
    y0 = y0 < threshold ? 0 : y0;
    y1 = y1 < threshold ? 0 : y1;

    const y2 = y0 + h0;
    const y3 = y1 + h1;
    const cpx = (x0 + x1) / 2;

    // prettier-ignore
    return (
      "M" + x0 + "," + y2 +
      "C" + cpx + "," + y2 + "," + cpx + "," + y3 + "," + x1 + "," + y3 +
      "L" + x1 + "," + y1 +
      "C" + cpx + "," + y1 + "," + cpx + "," + y0 + "," + x0 + "," + y0 +
      "Z"
    );
  };
}
