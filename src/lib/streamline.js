// @flow
import { path } from "d3";


export type Point = [number, number];

type Points = [Point, Point, Point, Point];

export function streamlineHorizontal() {
    return function streamline([p0, p1, p2, p3]: Points): string {
        const context = path();
        context.moveTo(p0[0], p0[1]);
        context.bezierCurveTo((p0[0] + p1[0]) / 2, p0[1], (p0[0] + p1[0]) / 2, p1[1], p1[0], p1[1]);
        context.lineTo(p2[0], p2[1]);
        context.bezierCurveTo((p2[0] + p3[0]) / 2, p2[1], (p2[0] + p3[0]) / 2, p3[1], p3[0], p3[1]);
        context.closePath();
        return context.toString();
    };
}
