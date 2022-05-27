import { Step, Steps } from "chakra-ui-steps";

export default function Stepper({
  activeStep,
  acceptedFormats,
}: {
  activeStep: number;
  acceptedFormats: string;
}) {
  return (
    <Steps
      activeStep={activeStep}
      // Uncomment this when chakra-ui-steps is updated to chakra-ui v2
      //labelOrientation="vertical"
      colorScheme="blue"
      sx={{ margin: "1em auto 2em", width: "90%" }}
    >
      <Step
        label="Run Infomap"
        // @ts-ignore
        description={
          <a href="//mapequation.org/infomap">
            Infomap Online or load net-files
          </a>
        }
      />
      <Step
        label="Load network partitions"
        // @ts-ignore
        description={
          <a href="//mapequation.org/infomap/#Output">
            Formats: {acceptedFormats}
          </a>
        }
      />
      <Step
        label="Create alluvial diagram"
        description="Highlight partition differences"
      />
    </Steps>
  );
}
