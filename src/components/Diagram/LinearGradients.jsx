import { cross } from "d3";
import { observer } from "mobx-react";
import { Fragment, useContext } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";

const id = (left, right, leftInsignificant, rightInsignificant) =>
  `gradient_${left}${leftInsignificant ? "i" : ""}_${right}${
    rightInsignificant ? "i" : ""
  }`;

function LinearGradients({ activeIndices }) {
  const { defaultHighlightColor: defaultColor, highlightColors } =
    useContext(StoreContext);

  const color = highlightColor(defaultColor, highlightColors);

  const leftOffset = "15%";
  const rightOffset = "85%";

  const insignificant = cross([true, false], [true, false]);

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

export default observer(LinearGradients);
