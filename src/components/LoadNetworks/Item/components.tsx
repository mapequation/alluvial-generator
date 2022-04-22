import { IconButton, Text, Tooltip } from "@chakra-ui/react";
import { Reorder, useMotionValue } from "framer-motion";
import { PropsWithChildren } from "react";
import { BiNetworkChart } from "react-icons/bi";
import { GrTextAlignFull } from "react-icons/gr";
import { IoLayersOutline, IoMenu } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import useRaisedShadow from "../../../hooks/useRaisedShadow";

export function LayerIcon() {
  return (
    <svg
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
    >
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        transform="translate(0, 100)"
        d="M434.8 137.65l-149.36-68.1c-16.19-7.4-42.69-7.4-58.88 0L77.3 137.65c-17.6 8-17.6 21.09 0 29.09l148 67.5c16.89 7.7 44.69 7.7 61.58 0l148-67.5c17.52-8 17.52-21.1-.08-29.09z"
      />
    </svg>
  );
}

export function ReorderItem({
  id,
  value,
  children,
}: PropsWithChildren<{ id: string; value: any }>) {
  const x = useMotionValue(0);
  const boxShadow = useRaisedShadow(x);

  return (
    <Reorder.Item
      id={id}
      value={value}
      className="child"
      role="group"
      style={{ boxShadow, x }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -100 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </Reorder.Item>
  );
}

export function NetworkIcon({
  file,
  onClick,
  color,
  bg,
}: {
  file: {
    isMultilayer?: boolean;
    isExpanded?: boolean;
    noModularResult?: boolean;
  };
  onClick: () => void;
  color: string;
  bg: string;
}) {
  const Icon = (() => {
    if (file.isMultilayer) {
      return file.isExpanded ? <LayerIcon /> : <IoLayersOutline />;
    }
    return file.noModularResult ? <GrTextAlignFull /> : <BiNetworkChart />;
  })();

  return (
    <IconButton
      aria-label={file.isMultilayer ? "multilayer" : "network"}
      onClick={file.isMultilayer ? onClick : undefined}
      pointerEvents={file.isMultilayer ? "auto" : "none"}
      icon={Icon}
      color={color}
      bg={bg}
      isRound={true}
      fontSize="1.3rem"
      size="md"
      boxShadow="md"
    />
  );
}

export function RemoveButton({
  onClick,
  color,
  bg,
}: {
  onClick: () => void;
  color: string;
  bg: string;
}) {
  return (
    <IconButton
      isRound
      size="xs"
      onClick={onClick}
      pos="absolute"
      top={2}
      right={2}
      opacity={0}
      transform="scale(0.9)"
      transition="all 0.2s"
      _groupHover={{
        opacity: 1,
        transform: "scale(1)",
      }}
      aria-label="delete"
      color={color}
      bg={bg}
      variant="ghost"
      fontSize="1.5rem"
      icon={<MdClear />}
    />
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton
      aria-label="settings"
      onClick={onClick}
      isRound
      size="sm"
      variant="ghost"
      pos="absolute"
      top={0}
      right={0}
      _focus={{
        outline: "none",
      }}
      icon={<IoMenu />}
    />
  );
}

export function TruncatedFilename({
  name,
  maxLength,
}: {
  name: string;
  maxLength: number;
}) {
  const truncatedName = ((name) => {
    const split = name.split(".");
    const ext = split.pop();
    const base = split.join(".");

    if (base.length < maxLength) return name;

    const hellip = String.fromCharCode(8230);
    return base.slice(0, maxLength) + hellip + ext;
  })(name);

  return (
    <Text fontWeight={600} overflowWrap="anywhere">
      {truncatedName.length === name.length ? (
        name
      ) : (
        <Tooltip label={name} aria-label={name}>
          {truncatedName}
        </Tooltip>
      )}
    </Text>
  );
}
