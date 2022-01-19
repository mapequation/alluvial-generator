import { extendTheme } from "@chakra-ui/react";
import { StepsStyleConfig as Steps } from "./chakra-ui-steps";

export const theme = extendTheme({
  components: {
    Steps,
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
});
