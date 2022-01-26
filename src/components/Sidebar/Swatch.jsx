import { Box, useColorModeValue } from "@chakra-ui/react";

export function Swatch({ color, isSelected, onClick }) {
  const border = useColorModeValue("whiteAlpha.800", "blackAlpha.600");

  return (
    <Box
      as="button"
      bg={color}
      h="24px"
      w="25px"
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
    />
  );
}
