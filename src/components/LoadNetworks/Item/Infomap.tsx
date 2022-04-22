import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

export default function Infomap({
  disabled,
  directed,
  setDirected,
  numTrials,
  setNumTrials,
  twoLevel,
  setTwoLevel,
  run,
}: {
  disabled: boolean;
  directed: boolean;
  setDirected: (directed: boolean) => void;
  numTrials: number;
  setNumTrials: (numTrials: number) => void;
  twoLevel: boolean;
  setTwoLevel: (twoLevel: boolean) => void;
  run: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FormControl isDisabled={disabled}>
        <HStack justify="space-between">
          <FormLabel fontSize="sm" fontWeight={400} htmlFor="num-trials" pt={1}>
            Trials
          </FormLabel>
          <NumberInput
            id="num-trials"
            size="xs"
            value={numTrials}
            onChange={(value) => setNumTrials(+value)}
            min={1}
            max={100}
            step={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
        <Checkbox
          isDisabled={disabled}
          size="sm"
          isChecked={directed}
          onChange={(e) => setDirected(e.target.checked)}
        >
          Directed
        </Checkbox>
        <Checkbox
          isDisabled={disabled}
          size="sm"
          isChecked={twoLevel}
          onChange={(e) => setTwoLevel(e.target.checked)}
        >
          Two-level
        </Checkbox>
        <Button
          mt={1}
          isDisabled={disabled}
          isLoading={disabled}
          size="xs"
          isFullWidth
          type="submit"
          onClick={run}
        >
          Run Infomap
        </Button>
      </FormControl>
    </motion.div>
  );
}
