import { LightMode, Tooltip as CkTooltip } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import ModuleTooltip from "./ModuleTooltip";

export default function Tooltip({
  children,
  ...props
}: PropsWithChildren<any>) {
  return (
    <LightMode>
      <CkTooltip
        hasArrow
        placement="top"
        shadow="xl"
        borderRadius="sm"
        openDelay={500}
        label={<ModuleTooltip {...props} />}
      >
        {children}
      </CkTooltip>
    </LightMode>
  );
}
