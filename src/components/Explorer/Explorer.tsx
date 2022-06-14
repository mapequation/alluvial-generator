import {
  Box,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import FileSaver from "file-saver";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import highlightColor from "../../utils/highlight-color";
import { Swatch } from "../Sidebar/components";

export default observer(function Explorer({
  onClose,
}: {
  onClose: () => void;
}) {
  const toast = useToast();
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "gray.700");

  const { selectedModule, defaultHighlightColor, highlightColors } = store;
  const fillColor = highlightColor(defaultHighlightColor, highlightColors);

  if (selectedModule == null) {
    onClose();
    return null;
  }

  const nodes = selectedModule.getLeafNodes().sort((a, b) => b.flow - a.flow);

  const downloadNames = () => {
    const names = nodes.map((node) => node.name).join("\n");
    FileSaver.saveAs(
      new Blob([names], { type: "text/plain;charset=utf-8" }),
      `${selectedModule.networkName}-module-${selectedModule.moduleId}.txt`
    );
  };

  const copyNames = async () => {
    if (!navigator.clipboard) return;
    const names = nodes.map((node) => node.name).join("\n");
    await navigator.clipboard.writeText(names);
    toast({
      status: "success",
      description: "Names copied to clipboard",
    });
  };

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"Module " + selectedModule.moduleId}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box maxH="20em" overflowY="scroll">
            <Table variant="striped" size="sm" colorScheme="gray">
              <Thead position="sticky" top={0} bg={bg}>
                <Tr>
                  <Th>Color</Th>
                  <Th>Name</Th>
                  <Th>Path</Th>
                  <Th isNumeric>Id</Th>
                  {nodes.length > 0 && nodes[0].stateId != null && (
                    <Th isNumeric>State id</Th>
                  )}
                  <Th isNumeric>Flow</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nodes.map((node) => (
                  <Tr key={node.nodeId}>
                    <Td>
                      <Swatch color={fillColor(node)} />
                    </Td>
                    <Td>{node.name}</Td>
                    <Td>{node.treePath.toString()}</Td>
                    <Td isNumeric>{node.nodeId}</Td>
                    {node.stateId != null && <Td isNumeric>{node.stateId}</Td>}
                    <Td isNumeric>{node.flow.toFixed(6)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter>
          {navigator.clipboard != null && (
            <Button mr="2" onClick={copyNames}>
              Copy names to clipboard
            </Button>
          )}
          <Button mr="auto" onClick={downloadNames}>
            Download names
          </Button>
          <Button isActive onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});
