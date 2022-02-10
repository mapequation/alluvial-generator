import { Step, Steps } from "chakra-ui-steps";

export default function Stepper({ activeStep, acceptedFormats }) {
  return (
    <Steps
      activeStep={activeStep}
      labelOrientation="vertical"
      colorScheme="blue"
      sx={{ margin: "1em auto 2em", width: "90%" }}
    >
      <Step
        label="Run Infomap"
        description={
          <a href="//mapequation.org/infomap">
            Infomap Online or load net-files
          </a>
        }
      />
      <Step
        label="Load network partitions"
        description={
          <a href="//mapequation.org/infomap/#Output">{acceptedFormats}</a>
        }
      />
      <Step
        label="Create alluvial diagram"
        description="Highlight partition differences"
      />
    </Steps>
  );
}
