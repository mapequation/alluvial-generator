import { HStack, useColorModeValue } from "@chakra-ui/react";
import ToggleColorMode from "./ToggleColorMode";

export default function Logo({ showVersion, long }) {
  const color = useColorModeValue("hsl(0, 0%, 33%)", "hsl(0, 0%, 60%)");
  const brand = useColorModeValue("hsl(0, 68%, 42%)", "hsl(0, 68%, 62%)");
  const version = useColorModeValue("hsl(0, 0%, 70%)", "hsl(0, 0%, 30%)");

  return (
    <HStack w="100%" justify="space-between" align="center">
      <HStack justify="flex-start" align="center" spacing={3}>
        <a href="//mapequation.org">
          <img
            alt="MapEquation"
            width="32px"
            height="32px"
            src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
          />
        </a>
        <div>
          <span
            style={{
              fontFamily: "Philosopher, serif",
              fontWeight: 700,
              fontSize: "1.4em",
            }}
          >
            <span style={{ color: brand }}>Alluvial</span>
            <span style={{ color }}> Diagram</span>
            {long && <span style={{ color }}> Generator</span>}
          </span>
          {showVersion && (
            <span style={{ color: version }}>
              {" v" + process.env.REACT_APP_VERSION}
            </span>
          )}
        </div>
      </HStack>
      <ToggleColorMode />
    </HStack>
  );
}
