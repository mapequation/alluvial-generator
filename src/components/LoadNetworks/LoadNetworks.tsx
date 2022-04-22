import {
  ChevronDownIcon,
  DeleteIcon,
  QuestionOutlineIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Skeleton,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence, Reorder } from "framer-motion";
import localforage from "localforage";
import { observer } from "mobx-react";
import { useCallback, useContext, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineDelete, MdUpload } from "react-icons/md";
import type { Identifier } from "../../alluvial";
import { useError } from "../../hooks/useError";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import Item from "./Item";
import "./LoadNetworks.css";
import Stepper from "./Stepper";
import type { NetworkFile } from "./types";
import {
  createFilesFromDiagramObject,
  expandMultilayerFile,
  getLocalStorageFiles,
  initialState,
  mergeMultilayerFiles,
  parseAcceptedFiles,
  reducer,
  setIdentifiers,
} from "./utils";

localforage.config({ name: "infomap" });

const acceptedFormats = [
  "tree",
  "ftree",
  "stree", // Not documented
  "clu",
  "json",
  "net",
  "zip",
] as const;

const dropzoneAccept = acceptedFormats.map((format) => `.${format}`).join(",");

const exampleDataFilename = "science-1998-2001-2007.json" as const;

async function fetchExampleData(filename = exampleDataFilename) {
  const res = await fetch(`/alluvial/data/${filename}`);
  return await res.json();
}

export default observer(function LoadNetworks({
  onClose,
}: {
  onClose: () => void;
}) {
  const store = useContext(StoreContext);
  const onError = useError();
  const dropzoneBg = useColorModeValue(
    "var(--chakra-colors-gray-50)",
    "var(--chakra-colors-gray-600)"
  );
  const [state, dispatch] = useReducer(reducer, initialState, (state) => ({
    ...state,
    files: store.files,
  }));

  const { files } = state;

  const onDrop = async (acceptedFiles: File[]) => {
    console.time("onDrop");
    dispatch({ type: "set", payload: { isLoadingFiles: true } });

    const [newFiles, errors] = await parseAcceptedFiles(
      acceptedFiles,
      files,
      acceptedFormats,
      store.identifier
    );

    errors.forEach(({ file, errors }) =>
      onError({
        title: `Could not load ${file.name}`,
        description: errors.map(({ message }) => message).join("\n"),
      })
    );

    dispatch({
      type: "set",
      payload: { files: [...files, ...newFiles], isLoadingFiles: false },
    });
    console.timeEnd("onDrop");
  };

  const { open, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    accept: dropzoneAccept,
    onDropRejected: (rejectedFiles) =>
      rejectedFiles.forEach((rejectedFile) =>
        onError({
          title: `Cannot open ${rejectedFile.file.name}`,
          description: rejectedFile.errors
            .map(({ message }) => message)
            .join("\n"),
        })
      ),
    onDrop,
  });

  const updateFile = (file: NetworkFile) => {
    const index = files.findIndex((f) => f.id === file.id);
    if (index === -1) return;

    dispatch({
      type: "set",
      payload: { files: files.map((f) => (f.id === file.id ? file : f)) },
    });
  };

  const createDiagram = useCallback(() => {
    dispatch({ type: "set", payload: { isCreatingDiagram: true } });
    store.setFiles(files);
    onClose();
  }, [onClose, files, store]);

  const loadExample = useCallback(async () => {
    console.time("loadExample");
    dispatch({
      type: "set",
      payload: { isLoadingExample: true, isLoadingFiles: true },
    });
    try {
      const json = await fetchExampleData();
      dispatch({
        type: "set",
        payload: {
          isCreatingDiagram: true,
          isLoadingExample: false,
          isLoadingFiles: false,
        },
      });
      const emptyFile = new File([], exampleDataFilename);
      const files = createFilesFromDiagramObject(json, emptyFile);
      dispatch({ type: "set", payload: { files } });
      setTimeout(() => {
        store.setFiles(files);
        onClose();
      }, 200);
    } catch (e: any) {
      onError({
        title: "Could not load example data",
        description: e.message,
      });
      dispatch({
        type: "set",
        payload: {
          isCreatingDiagram: false,
          isLoadingExample: false,
          isLoadingFiles: false,
        },
      });
    }
    console.timeEnd("loadExample");
  }, [onClose, store, onError]);

  const removeFileId = (id: string) => {
    dispatch({
      type: "set",
      payload: { files: files.filter((file) => file.id !== id) },
    });
  };

  const toggleMultilayerExpanded = (file: NetworkFile) => {
    if (!file.isMultilayer) return;

    if (file.isExpanded === undefined) {
      file.isExpanded = false;
    }

    if (!file.isExpanded) {
      // Decrease flow threshold as layers contain less flow than an individual file
      // TODO: Show a minimum number of modules per level in each network?
      if (store.flowThreshold > 1e-3) {
        store.setFlowThreshold(1e-3);
      }
    }

    const newFiles = file.isExpanded
      ? mergeMultilayerFiles(file, files)
      : expandMultilayerFile(file, files);

    dispatch({ type: "set", payload: { files: newFiles } });
  };

  useEventListener("keydown", (event) => {
    if (store.editMode) return;

    // @ts-ignore
    const key = event?.key;

    if (key === "c" && files.length > 0) {
      createDiagram();
    } else if (key === "e") {
      void loadExample();
    }
  });

  const updateIdentifiers = (identifier: Identifier) => {
    files.forEach((file) => {
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
    store.setIdentifier(identifier);
  };

  const loadLocalStorage = async () => {
    dispatch({ type: "set", payload: { localStorageFiles: [] } });

    try {
      const localStorageFiles = await getLocalStorageFiles();
      dispatch({ type: "set", payload: { localStorageFiles } });
    } catch (e: any) {
      console.warn(e.message);
    }
  };

  const activeStep = (() => {
    if (files.length === 0) return 1;

    return files.some((f) => !f.haveModules) ? 0 : 2;
  })();

  const {
    isLoadingExample,
    isLoadingFiles,
    infomapRunning,
    isCreatingDiagram,
    localStorageFiles,
  } = state;

  const buttonsDisabled =
    isLoadingFiles || isLoadingExample || infomapRunning || isCreatingDiagram;

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Load network partitions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stepper
            activeStep={activeStep}
            acceptedFormats={
              "Formats: " +
              acceptedFormats.filter((f) => f !== "stree").join(", ")
            }
          />

          <Skeleton isLoaded={!isLoadingFiles} rounded="md">
            <div
              style={{ background: dropzoneBg }}
              className="dropzone"
              {...getRootProps()}
            >
              <Reorder.Group
                className="parent"
                axis="x"
                layoutScroll
                values={files}
                onReorder={(files) =>
                  dispatch({ type: "set", payload: { files } })
                }
              >
                <AnimatePresence>
                  {files.map((file) => (
                    <Item
                      key={file.id}
                      file={file}
                      identifier={store.identifier}
                      onRemove={() => removeFileId(file.id)}
                      onMultilayerClick={() => toggleMultilayerExpanded(file)}
                      setIsRunning={(infomapRunning: boolean) =>
                        dispatch({ type: "set", payload: { infomapRunning } })
                      }
                      updateFile={updateFile}
                      onError={onError}
                    />
                  ))}
                </AnimatePresence>
              </Reorder.Group>
              <input {...getInputProps()} />
            </div>
          </Skeleton>
        </ModalBody>

        <ModalFooter>
          <Button
            disabled={buttonsDisabled}
            mr={2}
            onClick={loadExample}
            variant="outline"
            isLoading={isLoadingExample}
          >
            Load Example
          </Button>
          <Button
            disabled={files.length === 0 || buttonsDisabled}
            onClick={() => dispatch({ type: "reset" })}
            leftIcon={<MdOutlineDelete />}
            mr={8}
            variant="outline"
          >
            Clear
          </Button>
          <Box mr="auto">
            <NodeIdentifier
              isDisabled={files.length === 0 || buttonsDisabled}
              onChange={updateIdentifiers}
              identifier={store.identifier}
            />
          </Box>
          <Box mr={2}>
            <Menu onOpen={loadLocalStorage}>
              <MenuButton
                disabled={buttonsDisabled}
                as={Button}
                variant="outline"
                rightIcon={<ChevronDownIcon />}
              >
                Infomap Online
              </MenuButton>
              <MenuList>
                {localStorageFiles.map((file, i) => (
                  <MenuItem key={i} onClick={() => onDrop([file])}>
                    {file.name}
                  </MenuItem>
                ))}
                {localStorageFiles.length !== 0 && <MenuDivider />}
                <MenuItem
                  icon={<DeleteIcon />}
                  isDisabled={localStorageFiles.length === 0}
                  onClick={() => {
                    dispatch({
                      type: "set",
                      payload: { localStorageFiles: [] },
                    });
                    void localforage.clear();
                  }}
                >
                  Clear
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Button
            onClick={open}
            disabled={buttonsDisabled}
            mr={2}
            variant="outline"
            isActive={files.length === 0}
            leftIcon={<MdUpload />}
          >
            Open
          </Button>
          <Button
            variant="outline"
            disabled={
              files.length === 0 ||
              files.some((f) => !f.haveModules) ||
              infomapRunning ||
              isLoadingExample
            }
            isActive={files.length > 0}
            isLoading={isCreatingDiagram}
            onClick={createDiagram}
          >
            Create Diagram
          </Button>
        </ModalFooter>
      </ModalContent>
    </>
  );
});

function NodeIdentifier({
  isDisabled,
  onChange,
  identifier,
}: {
  isDisabled: boolean;
  onChange: (identifier: Identifier) => void;
  identifier: Identifier;
}) {
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
        onChange={onChange}
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
}
