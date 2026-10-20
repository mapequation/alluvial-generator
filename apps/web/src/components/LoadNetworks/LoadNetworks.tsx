import { Box, Button, Skeleton } from "@chakra-ui/react";
import { AnimatePresence, Reorder } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useReducer } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineDelete, MdUpload } from "react-icons/md";
import { useError } from "../../hooks/useError";
import useEventListener from "../../hooks/useEventListener";
import { StoreContext } from "../../store";
import { useColorModeValue } from "../ui/color-mode";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { initialState, LoadContext, reducer } from "./context";
import InfomapOnline from "./InfomapOnline";
import Item from "./Item";
import "./LoadNetworks.css";
import NodeIdentifier from "./NodeIdentifier";
import Stepper from "./Stepper";
import {
  parseAcceptedFiles,
  fetchScienceData,
} from "@mapequation/alluvial-diagram";

const acceptedFormats = [
  "tree",
  "ftree",
  "stree", // Not documented
  "clu",
  "json",
  "net",
  "zip",
] as const;

const dropzoneAccept: Record<string, string[]> = {
  "text/plain": [".tree", ".ftree", ".stree", ".clu", ".net"],
  "application/json": [".json"],
  "application/zip": [".zip"],
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
    files: store.networks,
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

    errors.forEach(({ file, errors, warning }) =>
      onError({
        title: warning
          ? `Loaded ${file.name} with a warning`
          : `Could not load ${file.name}`,
        description: errors.map(({ message }) => message).join("\n"),
        ...(warning && { type: "warning" as const }),
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
    // A saved diagram restores its options, module names and module order;
    // what could not be restored is shown as a warning.
    const warnings = store.openNetworks(files);
    if (warnings.length) {
      onError({
        title: "Some saved settings were not restored",
        description: warnings.join("\n"),
        type: "warning",
      });
    }
    onClose();
  }, [onClose, files, store, onError]);

  const loadExample = useCallback(async () => {
    console.time("loadExample");
    dispatch({
      type: "set",
      payload: { isLoadingExample: true, isLoadingFiles: true },
    });
    try {
      const files = await fetchScienceData();
      dispatch({ type: "set", payload: { files } });
      // Keep the Load Example spinner running until the modal closes; we
      // never want to flash the Create Diagram spinner on a click the user
      // didn't make.
      setTimeout(() => {
        store.setNetworks(files);
        onClose();
        // Reset local loading state once the diagram is built. LoadNetworks
        // is not unmounted when the dialog closes (DialogRoot keeps it
        // mounted), so the state would otherwise persist and the next time
        // the user re-opens the modal the Skeleton would hide the items and
        // the Load Example button would stay spinning.
        dispatch({
          type: "set",
          payload: { isLoadingExample: false, isLoadingFiles: false },
        });
      }, 200);
    } catch (e: any) {
      onError({
        title: "Could not load example data",
        description: e.message,
      });
      dispatch({
        type: "set",
        payload: { isLoadingExample: false, isLoadingFiles: false },
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Load network partitions</DialogTitle>
      </DialogHeader>
      <DialogCloseTrigger />
      <LoadContext.Provider value={{ state, dispatch }}>
        <DialogBody>
          <Stepper
            activeStep={(() => {
              if (files.length === 0) return 1;
              return files.some((f) => !f.haveModules) ? 0 : 2;
            })()}
            acceptedFormats={acceptedFormats
              .filter((f) => f !== "stree")
              .join(", ")}
          />

          <Skeleton loading={isLoadingFiles} rounded="md">
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
        </DialogBody>

        <DialogFooter>
          <Button
            disabled={buttonsDisabled}
            mr={2}
            onClick={loadExample}
            variant="outline"
            loading={isLoadingExample}
          >
            Load Example
          </Button>
          <Button
            disabled={files.length === 0 || buttonsDisabled}
            onClick={() => dispatch({ type: "reset" })}
            mr={8}
            variant="outline"
          >
            <MdOutlineDelete />
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
            data-active={files.length === 0 ? "" : undefined}
          >
            <MdUpload />
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
            data-active={files.length > 0 ? "" : undefined}
            loading={isCreatingDiagram}
            onClick={createDiagram}
          >
            Create Diagram
          </Button>
        </DialogFooter>
      </LoadContext.Provider>
    </DialogContent>
  );
});
