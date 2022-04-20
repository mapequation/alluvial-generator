import {
  ButtonGroup,
  Flex,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import * as d3 from "d3";
import { observer } from "mobx-react";
import { useCallback, useContext, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Real as RealData } from "../../../alluvial/Network";
import useMap, { MapOrEntries } from "../../../hooks/useMap";
import { StoreContext } from "../../../store";
import { Button } from "../utils";

interface RealProps {
  name: string;
  data: RealData;
  color: string;
}

type BinValue = RealData["values"][number];

export type Histogram = (d3.Bin<BinValue, number> & {
  x0: number;
  x1: number;
  count: number;
  color: string;
})[];

function createHistogram(
  bins: d3.Bin<BinValue, number>[],
  data: RealData,
  colors: Map<number, string>,
  defaultColor: string
) {
  return bins.map((bin, i) => ({
    ...bin,
    x0: bin.x0 ?? data.min,
    x1: bin.x1 ?? data.max,
    count: bin.length,
    color: colors.get(i) ?? defaultColor,
  }));
}

export default observer(function Real({ name, data, color }: RealProps) {
  const store = useContext(StoreContext);
  const { selectedScheme, defaultHighlightColor } = store;

  const [numBins, _setNumBins] = useState<number | null>(null);
  const [showQuartiles, setShowQuartiles] = useState(false);

  const bins = useMemo(() => {
    const binner = d3.bin<BinValue, number>();
    binner.value((d) => d.value);

    if (numBins != null) {
      binner.thresholds(numBins);
    }

    return binner(data.values);
  }, [numBins, data.values]);

  const defaultValues = useMemo(
    () =>
      d3
        .range(bins.length)
        .map((i) => [i, defaultHighlightColor]) as MapOrEntries<number, string>,
    [bins.length, defaultHighlightColor]
  );

  const [colors, actions] = useMap(defaultValues);

  const setNumBins = useCallback(
    (numBins: number | null) => {
      _setNumBins(numBins);
      actions.setAll(defaultValues);
    },
    [actions, defaultValues]
  );

  const hist = createHistogram(bins, data, colors, defaultHighlightColor);

  const scale = useMemo(
    () =>
      d3
        .scaleQuantize()
        .domain([data.min, data.max])
        .range(d3.range(selectedScheme.length)),
    [data.min, data.max, selectedScheme.length]
  );

  const paintWithScheme = () => {
    const { min, max } = data;
    const newColors = new Map(
      bins.map(({ x0, x1 }, binIndex) => {
        const midPoint = ((x0 ?? min) + (x1 ?? max)) / 2;
        const schemeIndex = scale(midPoint);
        return [binIndex, selectedScheme[schemeIndex]];
      })
    );

    const hist = createHistogram(bins, data, newColors, selectedScheme[0]);
    actions.setAll(newColors);
    store.colorRealMetadata(name, hist);
  };

  return (
    <>
      <Chart
        data={data}
        hist={hist}
        showQuartiles={showQuartiles}
        setColor={actions.set}
        color={color}
      />

      <StatisticSelector
        showQuartiles={showQuartiles}
        setShowQuartiles={() => setShowQuartiles(true)}
        setShowMean={() => setShowQuartiles(false)}
      />

      <BinInput
        length={bins.length}
        numBins={numBins}
        setNumBins={setNumBins}
      />

      <ButtonGroup isAttached w="100%" mt={1}>
        <Button
          onClick={() => store.colorRealMetadata(name, hist)}
          justifyContent="center"
        >
          Paint current colors
        </Button>
        <Button onClick={paintWithScheme} justifyContent="center">
          Paint using scheme
        </Button>
      </ButtonGroup>
    </>
  );
});

function Chart({
  data,
  hist,
  showQuartiles,
  setColor,
  color,
}: {
  data: RealData;
  hist: Histogram;
  showQuartiles: boolean;
  setColor: (index: number, color: string) => void;
  color: string;
}) {
  return (
    <BarChart
      width={300}
      height={200}
      data={hist}
      barCategoryGap={0}
      barGap={0}
      style={{ color: "#333" }}
      onClick={({ activeLabel }) => {
        if (activeLabel != null) setColor(+activeLabel, color);
      }}
    >
      <XAxis hide xAxisId="hidden" />
      <XAxis
        xAxisId="real"
        type="number"
        domain={[data.min, data.max]}
        tickFormatter={(d) => d.toFixed(2)}
      />
      <YAxis type="number" domain={["auto", "dataMax"]} />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" xAxisId="hidden">
        {hist.map(({ x0, x1, color }, i) => (
          <Cell cursor="pointer" fill={color} key={`cell-${i}`} />
        ))}
      </Bar>
      {showQuartiles &&
        data.quartiles.map((q, i) => (
          <ReferenceLine
            key={i}
            x={q}
            xAxisId="real"
            strokeDasharray={i % 2 === 0 ? "3 3" : "0"}
          />
        ))}
      {!showQuartiles && (
        <>
          <ReferenceLine x={data.mean} xAxisId="real" />
          <ReferenceLine
            x={data.mean - data.variance}
            xAxisId="real"
            strokeDasharray={"3 3"}
          />
          <ReferenceLine
            x={data.mean + data.variance}
            xAxisId="real"
            strokeDasharray={"3 3"}
          />
        </>
      )}
    </BarChart>
  );
}

function StatisticSelector({
  showQuartiles,
  setShowQuartiles,
  setShowMean,
}: {
  showQuartiles: boolean;
  setShowQuartiles: () => void;
  setShowMean: () => void;
}) {
  return (
    <ButtonGroup isAttached w="100%">
      <Button
        justifyContent="center"
        size="xs"
        isActive={showQuartiles}
        isDisabled={showQuartiles}
        onClick={setShowQuartiles}
      >
        Show quartiles
      </Button>
      <Button
        justifyContent="center"
        size="xs"
        isActive={!showQuartiles}
        isDisabled={!showQuartiles}
        onClick={setShowMean}
      >
        Show mean
      </Button>
    </ButtonGroup>
  );
}

const BinInput = observer(function BinInput({
  length,
  numBins,
  setNumBins,
}: {
  length: number;
  numBins: number | null;
  setNumBins: (n: number | null) => void;
}) {
  const store = useContext(StoreContext);

  return (
    <Flex mt={1} justify="space-between">
      <FormLabel fontSize="sm">Approx. number of bins</FormLabel>
      <NumberInput
        size="xs"
        min={4}
        step={1}
        maxW="30%"
        isRequired={false}
        value={numBins ?? length}
        onChange={(value) =>
          setNumBins(value === "" || +value <= 4 ? null : +value)
        }
        onFocus={() => store.setEditMode(true)}
        onBlur={() => store.setEditMode(false)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  );
});
