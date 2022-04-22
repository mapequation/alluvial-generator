import { useToast, UseToastOptions } from "@chakra-ui/react";
import { useCallback } from "react";

export type OnError = (props: UseToastOptions) => void;

export function useError(warn = false): OnError {
  const toast = useToast();

  return useCallback(
    ({ title, description, ...props }) => {
      if (warn) console.warn(description);
      toast({
        title,
        description,
        status: "error",
        duration: 5000,
        isClosable: true,
        ...props,
      });
    },
    [warn, toast]
  );
}
