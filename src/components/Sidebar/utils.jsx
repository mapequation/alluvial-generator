import {
  Button as CkButton,
  HStack,
  ListItem,
  Radio,
  RadioGroup as CkRadioGroup,
  Slider as CkSlider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch as CkSwitch,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function Button(props) {
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

export function ListItemButton(props) {
  return (
    <ListItem>
      <Button {...props} />
    </ListItem>
  );
}

export function ListItemHeader(props) {
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

export function Label({ children, ...props }) {
  return (
    <span style={{ display: "inline-block", width: "50%" }} {...props}>
      {children}
    </span>
  );
}

export function Slider({ label, value, onChange, valueLabelFormat, ...props }) {
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

export function RadioGroup({ legend, value, onChange, options }) {
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

export function Switch({ onChange, label, ...props }) {
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
