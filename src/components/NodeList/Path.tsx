import { chakra } from "@chakra-ui/react";
import { Fragment } from "react";
import TreePath from "../../utils/TreePath";

export default function Path({ path }: { path: TreePath }) {
  const pathArr = path.toArray();
  return (
    <>
      {pathArr.map((rank, level) => {
        const significant = path.isSignificant(level);
        return (
          <Fragment key={`${level}-${rank}`}>
            <chakra.span color={significant ? undefined : "gray.400"}>
              {rank}
            </chakra.span>
            {level !== pathArr.length - 1 && (
              <chakra.span color="gray.400">
                {significant ? ":" : ";"}
              </chakra.span>
            )}
          </Fragment>
        );
      })}
    </>
  );
}
