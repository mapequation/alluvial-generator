import { HStack, RadioGroup, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { LuCircleHelp } from "react-icons/lu";
import type { Identifier } from "@mapequation/alluvial-diagram";
import { StoreContext } from "../../store";
import { Tooltip } from "../ui/tooltip";
import { LoadContext } from "./context";
import {
  duplicateIdentifiers,
  duplicateIdentifiersMessage,
  setIdentifiers,
} from "@mapequation/alluvial-diagram";
import { useError } from "../../hooks/useError";

export default observer(function NodeIdentifier({
  isDisabled,
}: {
  isDisabled: boolean;
}) {
  const { identifier, setIdentifier } = useContext(StoreContext);
  const { state } = useContext(LoadContext);
  const onError = useError();

  // Warn like parseAcceptedFiles does on load when the new identifier is
  // shared by several nodes of a file.
  const warnDuplicates = (file: {
    name: string;
    nodes: { identifier?: string }[];
  }) => {
    const duplicates = duplicateIdentifiers(file.nodes);
    if (duplicates.length) {
      onError({
        title: `${file.name}: identifiers are not unique`,
        description: duplicateIdentifiersMessage(duplicates),
        type: "warning",
      });
    }
  };

  const updateIdentifiers = (identifier: Identifier) => {
    state.files.forEach((file) => {
      if (file.isExpanded) {
        return;
      }

      if (file.format === "net") {
        if (file.haveModules) {
          setIdentifiers(file.nodes, "ftree", identifier);
          warnDuplicates(file);
        }
        return;
      }

      setIdentifiers(file.nodes, file.format, identifier);
      warnDuplicates(file);
    });

    setIdentifier(identifier);
  };

  const tooltip = (
    <>
      Node identifiers are used to match nodes across different networks.
      <br />
      Choose between matching nodes by <strong>node id</strong> or{" "}
      <strong>node name</strong>.
      <br />
      When matching by name, the node names in each network{" "}
      <strong>must be unique</strong>.
    </>
  );

  return (
    <>
      <Text
        as="label"
        // @ts-expect-error - label htmlFor
        htmlFor="identifier"
        fontSize="sm"
        mr={0}
        mb={0}
      >
        Node Identifier{" "}
        <Tooltip showArrow positioning={{ placement: "top" }} content={tooltip}>
          <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
            <LuCircleHelp />
          </span>
        </Tooltip>
      </Text>
      <RadioGroup.Root
        disabled={isDisabled}
        onValueChange={(details) =>
          updateIdentifiers(details.value as Identifier)
        }
        value={identifier}
        size="sm"
      >
        <HStack gap={2}>
          <RadioGroup.Item value="id">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Id</RadioGroup.ItemText>
          </RadioGroup.Item>
          <RadioGroup.Item value="name">
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>Name</RadioGroup.ItemText>
          </RadioGroup.Item>
        </HStack>
      </RadioGroup.Root>
    </>
  );
});
