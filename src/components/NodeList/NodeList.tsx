import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Button,
  Checkbox,
  Flex,
  Input,
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
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useTableInstance,
  VisibilityState,
} from "@tanstack/react-table";
import FileSaver from "file-saver";
import { observer } from "mobx-react";
import { useContext, useEffect, useMemo, useState } from "react";
import type { LeafNode } from "../../alluvial";
import useDebounce from "../../hooks/useDebounce";
import { StoreContext } from "../../store";
import ColorSchemeSelect from "../Sidebar/ColorSchemeSelect";
import Swatch from "../Sidebar/Swatch";
import Pagination from "./Pagination";
import { columns, table } from "./table";

export default observer(function NodeList({
  onClose,
}: {
  onClose: () => void;
}) {
  const toast = useToast();
  const store = useContext(StoreContext);
  const bg = useColorModeValue("white", "gray.700");
  const [includeInsignificant, setIncludeInsignificant] = useState(true);
  const { selectedModule, defaultHighlightColor } = store;

  const data = useMemo(
    () => (selectedModule == null ? [] : selectedModule.getLeafNodes()),
    [selectedModule]
  );

  const [pagination, onPaginationChange] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [sorting, onSortingChange] = useState<SortingState>([
    { id: "flow", desc: true },
  ]);

  const [rowSelection, onRowSelectionChange] = useState<RowSelectionState>({});

  const [columnVisibility, onColumnVisibilityChange] =
    useState<VisibilityState>(() => {
      const state: VisibilityState = {};
      if (data.length === 0) return state;
      const first = data[0];
      if (first.stateId == null) state["stateId"] = false;
      if (first.layerId == null) state["layerId"] = false;
      return state;
    });

  const instance = useTableInstance(table, {
    data,
    columns,
    state: { pagination, sorting, rowSelection, columnVisibility },
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 100);

  const nameColumn = useMemo(() => instance.getColumn("name"), [instance]);

  useEffect(
    () => nameColumn.setFilterValue(debouncedSearch),
    [nameColumn, debouncedSearch]
  );

  if (selectedModule == null) {
    onClose();
    return null;
  }

  const getNames = () => {
    const leafNodes = !includeInsignificant
      ? data.filter((node) => !node.insignificant)
      : data;
    return leafNodes.map((node) => node.name).join("\n");
  };

  const getSelectedNodes = () =>
    instance
      .getSelectedRowModel()
      .flatRows.filter((row) => row.original != null)
      .map((row) => row.original) as LeafNode[];

  const downloadNames = () => {
    const names = getNames();
    FileSaver.saveAs(
      new Blob([names], { type: "text/plain;charset=utf-8" }),
      `${selectedModule.networkName}-module-${selectedModule.moduleId}.txt`
    );
  };

  const copyNames = async () => {
    if (!navigator.clipboard) return;
    const names = getNames();
    await navigator.clipboard.writeText(names);
    toast({
      status: "success",
      description: "Names copied to clipboard",
    });
  };

  const numericColumns = ["nodeId", "stateId", "layerId", "flow"];
  const noNodesSelected = instance.getSelectedRowModel().flatRows.length === 0;

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{"Module " + selectedModule.moduleId}</ModalHeader>
        <ModalCloseButton />
        <ModalBody minH="35em">
          <Input
            placeholder="Search names..."
            maxW="50%"
            autoFocus
            tabIndex={0}
            onFocus={() => store.setEditMode(true)}
            onBlur={() => store.setEditMode(false)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Table variant="striped" size="sm" colorScheme="gray" mt={4}>
            <Thead bg={bg}>
              {instance.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      isNumeric={numericColumns.includes(header.id)}
                    >
                      {!header.isPlaceholder && (
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.renderHeader()}
                          {{
                            asc: <ChevronUpIcon />,
                            desc: <ChevronDownIcon />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {instance.getRowModel().rows.map((row) => (
                <Tr key={row.id} w="100%">
                  {row.getVisibleCells().map((cell) => (
                    <Td
                      key={cell.id}
                      isNumeric={numericColumns.includes(cell.column.id)}
                      // TODO make this nicer
                      sx={{
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        maxW: "25em",
                      }}
                    >
                      {cell.renderCell()}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination instance={instance} />

          <ColorSchemeSelect w="300px" mt={4} />

          <Flex
            mt={4}
            gap={1}
            wrap="wrap"
            pointerEvents={noNodesSelected ? "none" : undefined}
            filter={noNodesSelected ? "grayscale(80%)" : undefined}
          >
            <Swatch
              color={defaultHighlightColor}
              onClick={() =>
                store.colorSelectedNodes(
                  getSelectedNodes(),
                  defaultHighlightColor
                )
              }
            />
            {store.selectedScheme.slice(0, 21).map((schemeColor, i) => (
              <Swatch
                key={`${i}-${schemeColor}`}
                color={schemeColor}
                onClick={() =>
                  store.colorSelectedNodes(getSelectedNodes(), schemeColor)
                }
              />
            ))}
          </Flex>
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
