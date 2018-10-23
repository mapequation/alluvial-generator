import { path } from "d3";

export function bracketHorizontal() {
  return function bracket({ x, y, width, height, textGap = 0 }) {
    const x1 = x + width;
    const y1 = y + height;

    const context = path();
    context.moveTo(x, y);
    context.lineTo(x, y1);
    if (textGap > 0) {
      context.lineTo(x + (width - textGap) / 2, y1);
      context.moveTo(x + (width + textGap) / 2, y1);
    }
    context.lineTo(x1, y1);
    context.lineTo(x1, y);
    return context.toString();
  };
}

export function bracketVertical(rightFacing = true) {
  const sign = (-1) ** Number(rightFacing);
  return function bracket({ x, y, width, height, textGap = 0 }) {
    const x1 = x + sign * width;
    const y1 = y + height;

    const context = path();
    context.moveTo(x, y);
    context.lineTo(x1, y);
    if (textGap > 0) {
      context.lineTo(x1, y + (height - textGap) / 2);
      context.moveTo(x1, y + (height + textGap) / 2);
    }
    context.lineTo(x1, y1);
    context.lineTo(x, y1);
    return context.toString();
  };
}
