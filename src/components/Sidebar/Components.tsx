import {
  Box,
  Button as CkButton,
  ButtonProps,
  HStack,
  ListItem,
  ListItemProps,
  Radio,
  RadioGroup as CkRadioGroup,
  Slider as CkSlider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Switch as CkSwitch,
  SwitchProps,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";

export function Button(props: ButtonProps) {
  return (
    <CkButton
      isFullWidth
      variant="outline"
      size="sm"
      justifyContent="flex-start"
      fontWeight={500}
      {...props}
    />
  );
}

export function ListItemButton(props: ButtonProps) {
  return (
    <ListItem>
      <Button {...props} />
    </ListItem>
  );
}

export function ListItemHeader(props: ListItemProps) {
  return (
    <ListItem
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="tight"
      fontSize="0.8rem"
      pt={6}
      {...props}
    />
  );
}

export function Label({ children, ...props }: any) {
  return (
    <span style={{ display: "inline-block", width: "50%" }} {...props}>
      {children}
    </span>
  );
}

export function Slider({
  label,
  value,
  onChange,
  valueLabelFormat,
  ...props
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  valueLabelFormat?: (value: number) => string | number;
} & SliderProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setCurrentValue(value), [value, setCurrentValue]);

  return (
    <ListItem>
      <Label>{label}</Label>
      <CkSlider
        defaultValue={value}
        value={currentValue}
        w="50%"
        size="sm"
        onChange={setCurrentValue}
        onChangeEnd={onChange}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        {...props}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <Tooltip
          hasArrow
          placement="top"
          bg="blue.600"
          isOpen={isOpen}
          label={
            valueLabelFormat != null
              ? valueLabelFormat(currentValue)
              : currentValue
          }
        >
          <SliderThumb />
        </Tooltip>
      </CkSlider>
    </ListItem>
  );
}

export function RadioGroup<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: T[];
}) {
  return (
    <ListItem>
      <HStack>
        <Label>{legend}</Label>
        <CkRadioGroup value={value} onChange={onChange} size="sm">
          <HStack>
            {options.map((value) => (
              <Radio value={value} key={value}>
                {value}
              </Radio>
            ))}
          </HStack>
        </CkRadioGroup>
      </HStack>
    </ListItem>
  );
}

export function Switch({
  label,
  onChange,
  ...props
}: {
  label: string;
  onChange: (value: boolean) => void;
} & Omit<SwitchProps, "onChange">) {
  return (
    <ListItem>
      <Label>{label}</Label>
      <CkSwitch
        size="sm"
        onChange={(event) => onChange(event.target.checked)}
        {...props}
      />
    </ListItem>
  );
}

interface SwatchProps {
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function Swatch({
  color,
  isSelected,
  onClick,
  children,
}: PropsWithChildren<SwatchProps>) {
  const border = useColorModeValue("whiteAlpha.800", "blackAlpha.600");

  return (
    <Box
      as="button"
      textAlign="center"
      fontSize="xs"
      fontWeight="bold"
      color="#000"
      textShadow="-0.6px -0.6px 0 #fff, 0.6px -0.6px 0 #fff, -0.6px 0.6px 0 #fff, 1px 1px 0 #fff"
      bg={color}
      h="24px"
      w="24px"
      rounded="sm"
      transition="all 0.1s linear"
      boxShadow={isSelected ? "lg" : "md"}
      borderWidth={3}
      borderColor={isSelected ? color : border}
      _hover={{
        transform: "scale(1.2)",
        borderColor: color,
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}
