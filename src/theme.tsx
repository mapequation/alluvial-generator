import { extendTheme } from "@chakra-ui/react";
import { StepsTheme as Steps } from "chakra-ui-steps";

export const theme = extendTheme({
  components: {
    Steps,
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
});
