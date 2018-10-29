import { path } from "d3";

export function bracketHorizontal() {
  return function bracket({ x, y, width, height, textGap = 0, radius = 2 }) {
    const r = Math.max(Math.min(width / 2, height, radius), 0);
    const gap = Math.min(width - 2 * r, textGap);

    const x1 = x;
    const y1 = y + height - r;
    const x2 = x + r;
    const y2 = y + height;
    const x3 = x + width - r;
    const y3 = y2;
    const x4 = x + width;
    const y4 = y1;
    const x5 = x4;
    const y5 = y;

    const context = path();
    context.moveTo(x, y);
    context.lineTo(x1, y1);
    context.arcTo(x1, y2, x2, y2, r);
    if (gap > 0) {
      context.lineTo(x + (width - gap) / 2, y2);
      context.moveTo(x + (width + gap) / 2, y2);
    }
    context.lineTo(x3, y3);
    context.arcTo(x4, y3, x4, y4, r);
    context.lineTo(x5, y5);
    return context.toString();
  };
}

function bracketVertical(left = true) {
  const sign = (-1) ** Number(left);
  return function bracket({ x, y, width, height, textGap = 0, radius = 2 }) {
    const r = Math.max(Math.min(width, height / 2, radius), 0);
    const gap = Math.min(height - 2 * r, textGap);

    const x1 = x + sign * (width - r);
    const y1 = y;
    const x2 = x + sign * width;
    const y2 = y + r;
    const x3 = x2;
    const y3 = y + height - r;
    const x4 = x1;
    const y4 = y + height;
    const x5 = x;
    const y5 = y4;

    const context = path();
    context.moveTo(x, y);
    context.lineTo(x1, y1);
    context.arcTo(x2, y1, x2, y2, r);
    if (gap > 0) {
      context.lineTo(x2, y + (height - gap) / 2);
      context.moveTo(x2, y + (height + gap) / 2);
    }
    context.lineTo(x3, y3);
    context.arcTo(x3, y4, x4, y4, r);
    context.lineTo(x5, y5);
    return context.toString();
  };
}

export function bracketVerticalLeft() {
  return bracketVertical();
}

export function bracketVerticalRight() {
  return bracketVertical(false);
}
