import { QuestionOutlineIcon } from "@chakra-ui/icons";
import {
  FormLabel,
  HStack,
  Radio,
  RadioGroup,
  Tooltip,
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import type { Identifier } from "../../alluvial";
import { StoreContext } from "../../store";
import { LoadContext } from "./context";
import { setIdentifiers } from "./utils";

export default observer(function NodeIdentifier({
  isDisabled,
}: {
  isDisabled: boolean;
}) {
  const { identifier, setIdentifier } = useContext(StoreContext);
  const { state } = useContext(LoadContext);

  const updateIdentifiers = (identifier: Identifier) => {
    state.files.forEach((file) => {
      if (file.isExpanded) {
        // No need to do anything: using node ids as identifier in an expanded
        // multilayer file is always correct.
        //setIdentifiers(file, "multilayer-expanded");
        return;
      }

      if (file.format === "net") {
        if (file.haveModules) {
          setIdentifiers(file.nodes, "ftree", identifier);
        }
        return;
      }

      setIdentifiers(file.nodes, file.format, identifier);
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
      <FormLabel fontSize="sm" htmlFor="identifier" mr={0} mb={0}>
        Node Identifier{" "}
        <Tooltip hasArrow placement="top" label={tooltip}>
          <QuestionOutlineIcon />
        </Tooltip>
      </FormLabel>
      <RadioGroup
        isDisabled={isDisabled}
        onChange={updateIdentifiers}
        value={identifier}
        size="sm"
      >
        <HStack spacing={2}>
          <Radio value="id">Id</Radio>
          <Radio value="name">Name</Radio>
        </HStack>
      </RadioGroup>
    </>
  );
});
