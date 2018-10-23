import { path } from "d3";

export function streamlineHorizontal() {
  return function streamline({ x0, y0, h0, x1, y1, h1 }) {
    const p0 = [x0, y0 + h0];
    const p1 = [x1, y1 + h1];
    const p2 = [x1, y1];
    const p3 = [x0, y0];
    const context = path();
    context.moveTo(p0[0], p0[1]);
    context.bezierCurveTo(
      (p0[0] + p1[0]) / 2,
      p0[1],
      (p0[0] + p1[0]) / 2,
      p1[1],
      p1[0],
      p1[1]
    );
    context.lineTo(p2[0], p2[1]);
    context.bezierCurveTo(
      (p2[0] + p3[0]) / 2,
      p2[1],
      (p2[0] + p3[0]) / 2,
      p3[1],
      p3[0],
      p3[1]
    );
    context.closePath();
    return context.toString();
  };
}
