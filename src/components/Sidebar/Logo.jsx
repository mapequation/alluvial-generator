import { HStack, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import ToggleColorMode from "../ToggleColorMode";

export default function Logo(props) {
  const bg = useColorModeValue("white", "var(--chakra-colors-gray-800)");
  const color = useColorModeValue("hsl(0, 0%, 33%)", "hsl(0, 0%, 60%)");
  const brand = useColorModeValue("hsl(0, 68%, 42%)", "hsl(0, 68%, 62%)");
  const version = useColorModeValue("hsl(0, 0%, 70%)", "hsl(0, 0%, 30%)");

  return (
    <>
      <motion.div
        style={{
          zIndex: 1999,
          position: "absolute",
          top: 0,
          left: 0,
          background: bg,
          width: "100%",
          height: "5rem",
        }}
        animate={{ top: props.in ? 0 : "-5rem" }}
        transition={{ duration: 0.2, delay: props.in ? 0 : 0.2 }}
      />
      <motion.div
        style={{
          zIndex: 2000,
          position: "absolute",
          top: 0,
          right: 0,
          height: "5rem",
        }}
        initial={false}
        animate={{ width: props.in ? "100%" : "350px" }}
        transition={{ duration: 0.2, delay: props.in ? 0.1 : 0 }}
      >
        <HStack w="100%" justify="space-between" align="center" p={5}>
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
                <span style={{ color }}>Alluvial</span>{" "}
                <span style={{ color: brand }}>Diagram</span>
              </span>
              <span style={{ color: version }}>
                {" v" + process.env.REACT_APP_VERSION}
              </span>
            </div>
          </HStack>
          <ToggleColorMode />
        </HStack>
      </motion.div>
    </>
  );
}
