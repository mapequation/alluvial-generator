import { StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { StepsStyleConfig as Steps } from "./chakra-ui-steps";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const theme = extendTheme({
  components: {
    Steps,
  },
});

ReactDOM.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
