import { path } from "d3";

type Position = {
  x0: number;
  y0: number;
  h0: number;
  x1: number;
  y1: number;
  h1: number;
};

/*
                    (cpx, p2.y) ________ p2, (x1, y1)
                      ________/        |
 (x0, y0), p3 ______/                  |
             |                         | h1
             |                         |
          h0 |                  _______|
             |        ________/         p1
             |______/
           p0       (cpx, p0.y)
 */
export function streamlineHorizontal() {
  const threshold = 1e-6;
  return function streamline({ x0, y0, h0, x1, y1, h1 }: Position) {
    y0 = y0 < threshold ? 0 : y0;
    y1 = y1 < threshold ? 0 : y1;

    const p0 = [x0, y0 + h0];
    const p1 = [x1, y1 + h1];
    const p2 = [x1, y1];
    const p3 = [x0, y0];
    const cpx = (x0 + x1) / 2;

    const context = path();
    context.moveTo(p0[0], p0[1]);
    context.bezierCurveTo(cpx, p0[1], cpx, p1[1], p1[0], p1[1]);
    context.lineTo(p2[0], p2[1]);
    context.bezierCurveTo(cpx, p2[1], cpx, p3[1], p3[0], p3[1]);
    context.closePath();
    return context.toString();
  };
}
