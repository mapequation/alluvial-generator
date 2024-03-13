import {
  Box,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence, Reorder } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineDelete, MdUpload } from "react-icons/md";
import { useError } from "../../hooks/useError";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import { initialState, LoadContext, reducer } from "./context";
import InfomapOnline from "./InfomapOnline";
import Item from "./Item";
import "./LoadNetworks.css";
import NodeIdentifier from "./NodeIdentifier";
import Stepper from "./Stepper";
import { parseAcceptedFiles, fetchScienceData } from "./utils";

const acceptedFormats = [
  "tree",
  "ftree",
  "stree", // Not documented
  "clu",
  "json",
  "net",
  "zip",
] as const;

const dropzoneAccept = {
  "text/plain": acceptedFormats.map((format) => `.${format}`),
};

type Props = {
  onClose: () => void;
};

export default observer(function LoadNetworks({ onClose }: Props) {
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
      const files = await fetchScienceData();
      dispatch({
        type: "set",
        payload: {
          isCreatingDiagram: true,
          isLoadingExample: false,
          isLoadingFiles: false,
        },
      });
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

  const {
    isLoadingExample,
    isLoadingFiles,
    infomapRunning,
    isCreatingDiagram,
  } = state;

  const buttonsDisabled =
    isLoadingFiles || isLoadingExample || infomapRunning || isCreatingDiagram;

  return (
    <>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Load network partitions</ModalHeader>
        <ModalCloseButton />
        <LoadContext.Provider value={{ state, dispatch }}>
          <ModalBody>
            <Stepper
              activeStep={(() => {
                if (files.length === 0) return 1;
                return files.some((f) => !f.haveModules) ? 0 : 2;
              })()}
              acceptedFormats={acceptedFormats
                .filter((f) => f !== "stree")
                .join(", ")}
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
                      <Item key={file.id} file={file} />
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
              />
            </Box>
            <Box mr={2}>
              <InfomapOnline
                isDisabled={buttonsDisabled}
                onFileClick={(file) => onDrop([file])}
              />
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
        </LoadContext.Provider>
      </ModalContent>
    </>
  );
});
