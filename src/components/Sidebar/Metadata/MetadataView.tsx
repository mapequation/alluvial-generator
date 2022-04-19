import { ButtonGroup, ListItem, Text } from "@chakra-ui/react";
import { Bar, BarChart, Scatter, ScatterChart, XAxis, YAxis } from "recharts";
import type {
  Categorical as CategoricalData,
  Real as RealData,
} from "../../../alluvial/Network";
import { Button } from "../utils";

interface CategoricalProps {
  data: CategoricalData;
}

export function Categorical({ data }: CategoricalProps) {
  return (
    <>
      <BarChart width={300} height={200} data={data.counts}>
        <XAxis dataKey="category" />
        <YAxis />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>

      <ListItem>
        <Text
          //color={headerColor}
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing="tight"
          fontSize="0.75rem"
          pt={2}
        >
          By module id
        </Text>
        <ButtonGroup isAttached w="100%" mt={1}>
          <Button
            // onClick={() => store.colorModuleIds(selectedModule, color)}
            // isDisabled={store.selectedModule === null}
            justifyContent="center"
          >
            Paint modules
          </Button>
          <Button
            // onClick={() => {
            //   store.colorModuleIdsInAllNetworks();
            //}}
            justifyContent="center"
          >
            Paint all
          </Button>
        </ButtonGroup>
      </ListItem>
    </>
  );
}

interface RealProps {
  data: RealData;
}

export function Real({ data }: RealProps) {
  return (
    <>
      <ScatterChart width={300} height={200} data={data.values}>
        <XAxis dataKey="node" />
        <YAxis />
        <Scatter type="monotone" dataKey="value" fill="#8884d8" />
      </ScatterChart>
      Stddev: {data.stddev}
      <br />
      Mean: {data.mean}
      <br />
      Quartiles: {data.quartiles.join(" - ")}
      <br />
    </>
  );
}
