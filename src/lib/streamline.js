import { linkHorizontal } from "d3";

export const streamlineHorizontal = () => {
    const link = linkHorizontal();
    return function streamline([p1, p2, p3, p4]) {
        return `${link({ source: p1, target: p2 })}L${p3}${link({ source: p3, target: p4 })}L${p1}`;
    };
};


