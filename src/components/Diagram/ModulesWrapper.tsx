import { MotionProps } from "framer-motion";
import { observer } from "mobx-react";
import { useContext } from "react";
import { Module as ModuleType, Network } from "../../alluvial";
import { StoreContext } from "../../store";
import { OutlineModule, ShadowModule } from "./HierarchicalModule";
import Module, { ModuleProps } from "./Module";

export type ModulesWrapperProps = { network: Network } & MotionProps &
  Omit<ModuleProps, "module">;

const ModulesWrapper = observer(function ModulesWrapper({
  network,
  transition,
  ...props
}: ModulesWrapperProps) {
  const {
    defaultHighlightColor,
    hierarchicalModules,
    hierarchicalModuleOffset,
    hierarchicalModuleOpacity,
  } = useContext(StoreContext);

  const modules =
    hierarchicalModules === "none"
      ? network.visibleChildren
      : network.hierarchicalChildren;

  return (
    <>
      {modules.map((module) => {
        if (hierarchicalModules === "none" || !("isLeaf" in module)) {
          const m = module as ModuleType;
          return (
            <Module key={m.id} transition={transition} {...props} module={m} />
          );
        } else if (hierarchicalModules === "shadow") {
          return (
            <ShadowModule
              key={module.path.toString()}
              module={module}
              transition={transition}
              fill={defaultHighlightColor}
              offset={hierarchicalModuleOffset}
              opacity={hierarchicalModuleOpacity}
            />
          );
        } else {
          return (
            <OutlineModule
              key={module.path.toString()}
              module={module}
              transition={transition}
              stroke={defaultHighlightColor}
              opacity={hierarchicalModuleOpacity}
            />
          );
        }
      })}
    </>
  );
});

export default ModulesWrapper;
