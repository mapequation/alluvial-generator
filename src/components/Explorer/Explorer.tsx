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
} from "@chakra-ui/react";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../store";
import { Swatch } from "../Sidebar/Swatch";

export default observer(function Explorer({
  onClose,
}: {
  onClose: () => void;
}) {
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "gray.700");

  const { selectedModule, defaultHighlightColor, highlightColors } = store;

  if (selectedModule == null) {
    onClose();
    return null;
  }

  const nodes = selectedModule.getLeafNodes().sort((a, b) => b.flow - a.flow);

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
                  <Th isNumeric>Id</Th>
                  <Th>Path</Th>
                  {nodes.length > 0 && nodes[0].stateId != null && (
                    <Th isNumeric>State id</Th>
                  )}
                  <Th isNumeric>Flow</Th>
                  <Th>Name</Th>
                  <Th>Color</Th>
                </Tr>
              </Thead>
              <Tbody>
                {nodes.map((node) => (
                  <Tr key={node.nodeId}>
                    <Td isNumeric>{node.nodeId}</Td>
                    <Td>{node.treePath.toString()}</Td>
                    {node.stateId != null && <Td isNumeric>{node.stateId}</Td>}
                    <Td isNumeric>{node.flow.toFixed(6)}</Td>
                    <Td>{node.name}</Td>
                    <Td>
                      <Swatch
                        color={
                          node.highlightIndex === -1
                            ? defaultHighlightColor
                            : highlightColors[node.highlightIndex]
                        }
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});
