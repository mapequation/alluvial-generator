import { Reorder, useMotionValue } from "framer-motion";
import {
  Box,
  IconButton,
  List,
  ListItem,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import useRaisedShadow from "../../hooks/useRaisedShadow";
import FileBackground from "./FileBackground";
import LayerIcon from "./LayerIcon";
import { IoLayersOutline } from "react-icons/io5";
import { BiNetworkChart } from "react-icons/bi";
import humanFileSize from "../../utils/human-file-size";
import { MdClear } from "react-icons/md";

export default function Item({ file, onRemove, onMultilayerClick }) {
  const x = useMotionValue(0);
  const bg = useColorModeValue("white", "gray.600");
  const fg = useColorModeValue("gray.800", "whiteAlpha.900");
  const fill = useColorModeValue(
    "var(--chakra-colors-gray-800)",
    "var(--chakra-colors-whiteAlpha-900)"
  );
  const boxShadow = useRaisedShadow(x);

  const truncatedName = ((name) => {
    const maxLength = 5;
    const nameParts = name.split(".");
    if (nameParts[0].length < maxLength) {
      return name;
    }
    return nameParts[0].slice(0, maxLength) + "..." + nameParts[1];
  })(file.name);

  return (
    <Reorder.Item
      id={file.id}
      value={file}
      className="child"
      role="group"
      style={{ boxShadow, x }}
    >
      <FileBackground
        file={file}
        style={{ position: "absolute" }}
        fill={fill}
      />
      <Box maxW="100%" h="100%" pos="relative" bg="transparent">
        <Box p={2}>
          {file.isMultilayer ? (
            <IconButton
              onClick={onMultilayerClick}
              aria-label="expand"
              isRound
              icon={file.isExpanded ? <LayerIcon /> : <IoLayersOutline />}
              size="md"
              fontSize="1.3rem"
              color={fg}
              bg={bg}
              boxShadow="md"
            />
          ) : (
            <IconButton
              aria-label="graph"
              isRound
              icon={<BiNetworkChart />}
              size="md"
              fontSize="1.3rem"
              pointerEvents="none"
              color={fg}
              bg={bg}
              boxShadow="md"
            />
          )}

          <List
            bg={bg}
            fontSize="sm"
            borderRadius={5}
            boxShadow="md"
            p={2}
            mt={8}
          >
            <ListItem fontWeight={600} overflowWrap="anyhwere">
              {truncatedName.length === file.name.length ? (
                file.name
              ) : (
                <Tooltip label={file.name} aria-label={file.name}>
                  {truncatedName}
                </Tooltip>
              )}
            </ListItem>

            {file.isMultilayer && !file.isExpanded && (
              <ListItem>{file.numLayers + " layers"}</ListItem>
            )}
            {file.isMultilayer && file.isExpanded && (
              <ListItem>{"layer " + file.layerId}</ListItem>
            )}
            {file.nodes && (
              <ListItem>
                {file.nodes.length +
                  (file.isStateNetwork ? " state nodes" : " nodes")}
              </ListItem>
            )}
            {file.numTopModules && (
              <ListItem>
                {file.numTopModules +
                  (file.numTopModules > 1 ? " top modules" : " top module")}
              </ListItem>
            )}
            {file.numLevels && (
              <ListItem>
                {file.numLevels + (file.numLevels > 1 ? " levels" : "level")}
              </ListItem>
            )}
            {file.codelength && (
              <ListItem>{file.codelength.toFixed(3) + " bits"}</ListItem>
            )}
            {file.size > 0 && <ListItem>{humanFileSize(file.size)}</ListItem>}
          </List>

          <IconButton
            isRound
            size="xs"
            onClick={onRemove}
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
            color={fg}
            bg={bg}
            variant="ghost"
            fontSize="1.5rem"
            icon={<MdClear />}
          />
        </Box>
      </Box>
    </Reorder.Item>
  );
}
