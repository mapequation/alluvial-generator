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
  useToast,
} from "@chakra-ui/react";
import { parse } from "@mapequation/infomap-parser";
import { AnimatePresence, Reorder } from "framer-motion";
import localforage from "localforage";
import { observer } from "mobx-react";
import { useCallback, useContext, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineDelete, MdUpload } from "react-icons/md";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import Item from "./Item";
import "./LoadNetworks.css";
import Stepper from "./Stepper";
import {
  calcStatistics,
  createFilesFromDiagramObject,
  expandMultilayerFile,
  getLocalStorageFiles,
  mergeMultilayerFiles,
  parseAcceptedFiles,
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
];

const dropzoneAccept = acceptedFormats.map((format) => `.${format}`).join(",");

const exampleDataFilename = "science-1998-2001-2007.json";

async function fetchExampleData(filename = exampleDataFilename) {
  const res = await fetch(`/alluvial/data/${filename}`);
  return await res.json();
}

const initialState = {
  isCreatingDiagram: false,
  isLoadingExample: false,
  isLoadingFiles: false,
  infomapRunning: false,
  files: [],
  localStorageFiles: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "set":
      return { ...state, ...action.payload };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export default observer(function LoadNetworks({ onClose }) {
  const store = useContext(StoreContext);
  const toast = useToast();
  const dropzoneBg = useColorModeValue(
    "var(--chakra-colors-gray-50)",
    "var(--chakra-colors-gray-600)"
  );
  const [state, dispatch] = useReducer(reducer, initialState, (state) => ({
    ...state,
    files: store.files,
  }));

  const { files } = state;

  const onError = useCallback(
    ({ title, description, ...props }) => {
      console.warn(description);
      toast({
        title,
        description,
        status: "error",
        duration: 5000,
        isClosable: true,
        ...props,
      });
    },
    [toast]
  );

  const onDrop = async (acceptedFiles) => {
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

  const updateFileWithTree = (file, tree) => {
    const index = files.findIndex((f) => f.id === file.id);

    if (index === -1) {
      return;
    }

    try {
      const contents = parse(tree, null, true);

      setIdentifiers(contents, "ftree", store.identifier);

      Object.assign(file, {
        noModularResult: false,
        ...contents,
        ...calcStatistics(contents),
      });

      dispatch({
        type: "set",
        payload: { files: files.map((f) => (f.id === file.id ? file : f)) },
      });
    } catch (e) {
      onError({
        title: `Could not parse ${file.name}`,
        description: e.message,
      });
    }
  };

  const createDiagram = useCallback(() => {
    // TODO already loaded?
    // TODO set state from json
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
    } catch (e) {
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

  const removeFileId = (id) => {
    dispatch({
      type: "set",
      payload: { files: files.filter((file) => file.id !== id) },
    });
  };

  const toggleMultilayerExpanded = (file) => {
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

    if (event?.key === "c" && files.length > 0) {
      createDiagram();
    } else if (event?.key === "e") {
      loadExample();
    }
  });

  const updateIdentifiers = (identifier) => {
    files.forEach((file) => {
      if (file.isExpanded) {
        // No need to do anything
        //setIdentifiers(file, "multilayer-expanded");
        return;
      }

      if (file.format === "net") {
        if (!file.noModularResult) {
          setIdentifiers(file, "ftree", identifier);
        }
        return;
      }

      setIdentifiers(file, file.format, identifier);
    });
    store.setIdentifier(identifier);
  };

  const loadLocalStorage = async () => {
    dispatch({ type: "set", payload: { localStorageFiles: [] } });

    try {
      const localStorageFiles = await getLocalStorageFiles();
      dispatch({ type: "set", payload: { localStorageFiles } });
    } catch (e) {
      console.warn(e.message);
    }
  };

  let activeStep = 1;
  if (files.length > 0) {
    activeStep = files.some((f) => f.noModularResult) ? 0 : 2;
  }

  const {
    isCreatingDiagram,
    isLoadingExample,
    isLoadingFiles,
    infomapRunning,
    localStorageFiles,
  } = state;

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
                      onRemove={() => removeFileId(file.id)}
                      onMultilayerClick={() => toggleMultilayerExpanded(file)}
                      setIsRunning={(infomapRunning) =>
                        dispatch({ type: "set", payload: { infomapRunning } })
                      }
                      updateFile={updateFileWithTree}
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
            disabled={
              isLoadingFiles ||
              infomapRunning ||
              isLoadingExample ||
              isCreatingDiagram
            }
            mr={2}
            onClick={loadExample}
            variant="outline"
            isLoading={isLoadingExample}
          >
            Load Example
          </Button>
          <Button
            disabled={
              files.length === 0 ||
              infomapRunning ||
              isLoadingExample ||
              isCreatingDiagram
            }
            onClick={() => dispatch({ type: "reset" })}
            leftIcon={<MdOutlineDelete />}
            mr={8}
            variant="outline"
          >
            Clear
          </Button>
          <Box mr="auto">
            <FormLabel fontSize="sm" htmlFor="identifier" mr={0} mb={0}>
              Node Identifier{" "}
              <Tooltip
                hasArrow
                placement="top"
                label="Node identifiers are used to match nodes across different networks. Choose between matching nodes by node id or node name."
              >
                <QuestionOutlineIcon />
              </Tooltip>
            </FormLabel>
            <RadioGroup
              isDisabled={
                files.length === 0 ||
                isLoadingExample ||
                infomapRunning ||
                isCreatingDiagram
              }
              onChange={updateIdentifiers}
              value={store.identifier}
              size="sm"
            >
              <HStack spacing={2}>
                <Radio value="id">Id</Radio>
                <Radio value="name">Name</Radio>
              </HStack>
            </RadioGroup>
          </Box>
          <Box mr={2}>
            <Menu onOpen={loadLocalStorage}>
              <MenuButton
                disabled={
                  isLoadingFiles ||
                  infomapRunning ||
                  isLoadingFiles ||
                  isCreatingDiagram
                }
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
                    localforage.clear();
                  }}
                >
                  Clear
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Button
            onClick={open}
            disabled={
              isLoadingFiles ||
              infomapRunning ||
              isLoadingExample ||
              isCreatingDiagram
            }
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
              files.some((f) => f.noModularResult) ||
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
