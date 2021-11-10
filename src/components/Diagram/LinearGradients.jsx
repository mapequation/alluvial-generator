//import { cross, hsl as d3_hsl } from "d3";
import { observer } from "mobx-react";
import { Fragment, useContext } from "react";
//import { NOT_HIGHLIGHTED } from "../../alluvial/HighlightGroup";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";

const id = (left, right, leftInsignificant, rightInsignificant) =>
  `gradient_${left}${leftInsignificant ? "i" : ""}_${right}${
    rightInsignificant ? "i" : ""
  }`;

const strokeId = (left, right) => `gradient-stroke_${left}_${right}`;

// const stroke = (color, highlightIndex) => {
//   if (highlightIndex === NOT_HIGHLIGHTED) {
//     return "#fff";
//   }

//   const hsl = d3_hsl(color);
//   hsl.s += 0.2;
//   hsl.l -= 0.2;
//   return hsl.toString();
// };

function LinearGradients({ activeIndices }) {
  const { defaultHighlightColor: defaultColor, highlightColors } =
    useContext(StoreContext);

  // const highlightIndices = [NOT_HIGHLIGHTED, ...highlightColors.keys()];
  // const pairs = cross(highlightIndices, highlightIndices);
  const color = highlightColor(defaultColor, highlightColors);

  const leftOffset = "15%";
  const rightOffset = "85%";

  //const insignificant = cross([true, false], [true, false]);
  const insignificant = [[false, false]];

  return (
    <>
      {insignificant.map(([leftInsignificant, rightInsignificant]) =>
        activeIndices.map(([leftHighlightIndex, rightHighlightIndex]) => {
          const _id = id(
            leftHighlightIndex,
            rightHighlightIndex,
            leftInsignificant,
            rightInsignificant
          );
          return (
            <Fragment key={_id}>
              <linearGradient id={_id}>
                <stop
                  offset={leftOffset}
                  stopColor={color({
                    highlightIndex: leftHighlightIndex,
                    insignificant: leftInsignificant,
                  })}
                />
                <stop
                  offset={rightOffset}
                  stopColor={color({
                    highlightIndex: rightHighlightIndex,
                    insignificant: rightInsignificant,
                  })}
                />
              </linearGradient>
              {/* <linearGradient
                id={strokeId(leftHighlightIndex, rightHighlightIndex)}
              >
                <stop
                  offset={leftOffset}
                  stopColor={stroke(
                    color({
                      highlightIndex: leftHighlightIndex,
                      insignificant: leftInsignificant,
                    }),
                    leftHighlightIndex
                  )}
                />
                <stop
                  offset={rightOffset}
                  stopColor={stroke(
                    color({
                      highlightIndex: rightHighlightIndex,
                      insignificant: rightInsignificant,
                    }),
                    rightHighlightIndex
                  )}
                />
              </linearGradient> */}
            </Fragment>
          );
        })
      )}
    </>
  );
}

LinearGradients.fill = (d) =>
  `url(#${id(
    d.leftHighlightIndex,
    d.rightHighlightIndex,
    d.leftInsignificant,
    d.rightInsignificant
  )})`;

LinearGradients.stroke = (d) =>
  `url(#${strokeId(d.leftHighlightIndex, d.rightHighlightIndex)})`;

export default observer(LinearGradients);
