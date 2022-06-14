import {
  Box,
  Button,
  Checkbox,
  Flex,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
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
import { useContext, useMemo, useState } from "react";
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
  const [includeInsignificant, setIncludeInsignificant] = useState(true);

  const { selectedModule, defaultHighlightColor, highlightColors } = store;
  const fillColor = highlightColor(defaultHighlightColor, highlightColors);

  const nodes = useMemo(() => {
    if (selectedModule == null) return [];
    let nodes = selectedModule.getLeafNodes();
    if (!includeInsignificant) {
      nodes = nodes.filter((node) => !node.insignificant);
    }
    nodes.sort((a, b) => b.flow - a.flow);
    return nodes;
  }, [selectedModule, includeInsignificant]);

  if (selectedModule == null) {
    onClose();
    return null;
  }

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
          <Box maxH="40em" overflowY="scroll">
            <Table
              variant="striped"
              size="sm"
              colorScheme="gray"
              id={`table-update-${store.updateFlag}`}
            >
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
                {nodes.map((node) => {
                  const color = fillColor(node);
                  return (
                    <Tr key={node.nodeId}>
                      <Td>
                        <Popover isLazy placement="top">
                          <PopoverTrigger>
                            <Swatch color={color} />
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody>
                              <Flex mt={2} gap={1} wrap="wrap">
                                <Swatch
                                  color={defaultHighlightColor}
                                  isSelected={color === defaultHighlightColor}
                                  onClick={() =>
                                    store.colorPhysicalNodeInAllNetworks(
                                      node.nodeId,
                                      defaultHighlightColor
                                    )
                                  }
                                />
                                {store.selectedScheme
                                  .slice(0, 21)
                                  .map((schemeColor, i) => (
                                    <Swatch
                                      key={`${i}-${schemeColor}`}
                                      color={schemeColor}
                                      isSelected={color === schemeColor}
                                      onClick={() =>
                                        store.colorPhysicalNodeInAllNetworks(
                                          node.nodeId,
                                          schemeColor
                                        )
                                      }
                                    />
                                  ))}
                              </Flex>
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      </Td>
                      <Td>{node.name}</Td>
                      <Td>{node.treePath.toString()}</Td>
                      <Td isNumeric>{node.nodeId}</Td>
                      {node.stateId != null && (
                        <Td isNumeric>{node.stateId}</Td>
                      )}
                      <Td isNumeric>{node.flow.toFixed(6)}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button mr={2} onClick={downloadNames}>
            Download names
          </Button>
          {navigator.clipboard != null && (
            <Button mr={2} onClick={copyNames}>
              Copy names to clipboard
            </Button>
          )}
          <Checkbox
            isChecked={includeInsignificant}
            onChange={(event) => setIncludeInsignificant(event.target?.checked)}
            mr="auto"
          >
            Include insignificant
          </Checkbox>
          <Button isActive onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});
