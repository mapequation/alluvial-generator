import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap/parser";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Reorder, useMotionValue } from "framer-motion";
import { observer } from "mobx-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StoreContext } from "../store";
import humanFileSize from "../utils/human-file-size";
import id from "../utils/id";
import "./LoadNetworks.css";
import useRaisedShadow from "../hooks/useRaisedShadow";
import TreePath from "../utils/TreePath";

const acceptedFormats = [".tree", ".ftree", ".clu", ".json"].join(",");
const exampleDataFilename = "science-1998-2001-2007.json";

async function fetchExampleData(filename = exampleDataFilename) {
  const res = await fetch(`/alluvial/data/${filename}`);
  return await res.json();
}

export default observer(function LoadNetworks({ onClose }) {
  const store = useContext(StoreContext);
  const [files, setFiles] = useState(store.files);
  const [errors, setErrors] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(-1);

  const reset = useCallback(() => {
    setFiles([]);
    setErrors([]);
    setRejected([]);
    setErrorsOpen(false);
  }, [setFiles, setErrors, setRejected, setErrorsOpen]);

  const showErrors = () => {
    if (errorsOpen) return;
    setErrorsOpen(true);
    setTimeoutId(window.setTimeout(() => setErrorsOpen(false), 5000));
  };

  const { open, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    accept: acceptedFormats,
    onDropRejected: (rejectedFiles) => {
      setRejected(rejectedFiles);
      if (rejectedFiles.length > 0) showErrors();
    },
    onDrop: async (acceptedFiles) => {
      console.time("onDrop");
      setErrors([]);

      const readFiles = await Promise.all(acceptedFiles.map(readFile));
      const newFiles = [];
      const newErrors = [];

      for (let i = 0; i < acceptedFiles.length; ++i) {
        const file = acceptedFiles[i];
        const format = fileExtension(file.name);

        let contents = null;

        if (format === "json") {
          try {
            contents = JSON.parse(readFiles[i]);

            if (contents.networks !== undefined) {
              // a diagram contains several networks
              // duplicate file for each network
              newFiles.push(...createFilesFromDiagramObject(contents, file));

              // if any file ids already exist, give a new id
              for (let file of newFiles) {
                if (files.some((f) => f.id === file.id)) {
                  file.id = id();
                }
              }
              continue;
            }
          } catch (e) {
            console.error(e);
            newErrors.push({
              file,
              errors: [
                {
                  code: "invalid-json",
                  message: e.message,
                },
              ],
            });
            continue;
          }
        } else {
          contents = parse(readFiles[i]);
        }

        if (!contents) {
          console.error(`Could not parse ${file.name}`);
          newErrors.push({
            file,
            errors: [
              {
                code: "invalid-format",
                message: "Could not parse file",
              },
            ],
          });
          continue;
        }

        setIdentifiers(contents.nodes, format);

        newFiles.push(
          Object.assign(file, {
            id: id(),
            format,
            ...contents,
          })
        );
      }

      setFiles([...files, ...newFiles]);
      setErrors(newErrors);
      if (newErrors.length > 0) showErrors();
      console.timeEnd("onDrop");
    },
  });

  const createDiagram = useCallback(() => {
    // TODO already loaded?
    // TODO set state from json
    store.setFiles(files);
    onClose();
  }, [onClose, files, store]);

  const loadExample = useCallback(async () => {
    console.time("loadExample");
    try {
      const json = await fetchExampleData();
      const emptyFile = new File([], exampleDataFilename);
      const files = createFilesFromDiagramObject(json, emptyFile);
      store.setFiles(files);
      onClose();
    } catch (e) {
      console.error(e);
    }
    console.timeEnd("loadExample");
  }, [onClose, store]);

  const removeFileId = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
  };

  useEffect(() => {
    const onKeyPress = (e) => {
      e.preventDefault();
      if (e.key === "c" && files.length > 0) {
        createDiagram();
      } else if (e.key === "Backspace") {
        reset();
      } else if (e.key === "e") {
        loadExample();
      }
    };

    document.addEventListener("keydown", onKeyPress);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", onKeyPress);
    };
  }, [files, timeoutId, createDiagram, reset, loadExample]);

  const fileErrors = [...errors, ...rejected];

  return (
    <>
      <DialogTitle>Load network partitions</DialogTitle>
      <DialogContent>
        <MyStepper activeStep={files.length > 0 ? 2 : 1} />

        <div className="dropzone" {...getRootProps()}>
          <Reorder.Group
            className="parent"
            axis="x"
            layoutScroll
            values={files}
            onReorder={setFiles}
          >
            {files.map((file, i) => (
              <Item
                number={i + 1}
                key={file.id}
                file={file}
                onClick={removeFileId}
              />
            ))}
          </Reorder.Group>
          <input {...getInputProps()} />
        </div>

        <Collapse in={errorsOpen}>
          <Stack spacing={2} my={2}>
            {fileErrors.map(({ file, errors }, i) => (
              <Alert key={i} severity="error">
                <AlertTitle>{file.name}</AlertTitle>
                {errors[0].message}
              </Alert>
            ))}
          </Stack>
        </Collapse>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={loadExample}>
          Load Example
        </Button>
        <Button
          variant="outlined"
          disabled={files.length === 0}
          onClick={reset}
          startIcon={<DeleteIcon />}
          sx={{ marginRight: "auto" }}
        >
          Clear
        </Button>
        <Button variant="contained" onClick={open} startIcon={<UploadIcon />}>
          Open
        </Button>
        <Button
          variant="contained"
          disabled={files.length === 0}
          onClick={createDiagram}
        >
          Create Diagram
        </Button>
      </DialogActions>
    </>
  );
});

function Text({ children }) {
  return (
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {children}
    </Typography>
  );
}

function Item({ number, file, onClick }) {
  const x = useMotionValue(0);
  const boxShadow = useRaisedShadow(x);

  const truncatedName = ((name) => {
    const maxLength = 10;
    const nameParts = name.split(".");
    if (nameParts[0].length < maxLength) {
      return name;
    }
    return nameParts[0].slice(0, maxLength) + "..." + nameParts[1];
  })(file.name);

  return (
    <Reorder.Item
      id={file.id}
      value={file}
      className="child"
      style={{ boxShadow, x }}
    >
      <Card sx={{ maxWidth: "100%", height: "100%" }} variant="outlined">
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            {number}
          </Typography>
          <Tooltip title={file.name}>
            <Typography
              fontSize={14}
              sx={{ overflowWrap: "anywhere" }}
              gutterBottom
            >
              {truncatedName}
            </Typography>
          </Tooltip>

          {file.size > 0 && <Text>{humanFileSize(file.size)}</Text>}
          {file.nodes && <Text>{file.nodes.length} nodes</Text>}
          {file.numTopModules && <Text>{file.numTopModules} top modules</Text>}
          {file.numLevels && <Text>{file.numLevels} levels</Text>}
          {file.codelength && <Text>{file.codelength.toFixed(3)} bits</Text>}
          <IconButton
            size="small"
            onClick={() => onClick(file.id)}
            className="delete-button"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>
    </Reorder.Item>
  );
}

function MyStepper({ activeStep }) {
  return (
    <Stepper
      activeStep={activeStep}
      sx={{ margin: "1em auto 2em", width: "90%" }}
    >
      <Step>
        <StepLabel
          optional={
            <Typography variant="caption">
              Infomap Online or standalone
            </Typography>
          }
        >
          <a href="//mapequation.org/infomap">Run Infomap</a>
        </StepLabel>
      </Step>
      <Step>
        <StepLabel
          optional={
            <Typography variant="caption">
              Infomap output formats: {acceptedFormats}
            </Typography>
          }
        >
          Load network partitions
        </StepLabel>
      </Step>
      <Step>
        <StepLabel
          optional={
            <Typography variant="caption">
              Highlight partition differences
            </Typography>
          }
        >
          Create alluvial diagram
        </StepLabel>
      </Step>
    </Stepper>
  );
}

function createFilesFromDiagramObject(json, file) {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network) => network.nodes.length)
      .reduce((tot, b) => tot + b, 0) || 1;

  // TODO extract state

  return json.networks.map((network) => {
    setIdentifiers(network.nodes, "json");
    return {
      ...file,
      lastModified: file.lastModified,
      size: (file.size * network.nodes.length) / totNodes,
      name: network.name,
      id: network.id,
      format: "json",
      ...network,
    };
  });
}

function setIdentifiers(nodes, format) {
  const stateOrNodeId = (node) =>
    node.stateId != null ? node.stateId : node.id;

  if (format === "json") {
    nodes.forEach((node) => {
      node.identifier = node.identifier ?? stateOrNodeId(node).toString();
      if (!Array.isArray(node.path)) {
        node.path = TreePath.toArray(node.path);
      }
    });
  } else if (format === "tree" || format === "ftree") {
    nodes.forEach((node) => (node.identifier = stateOrNodeId(node).toString()));
  } else if (format === "clu") {
    nodes.forEach((node) => {
      const id = stateOrNodeId(node);
      node.path = node.moduleId.toString();
      node.identifier = id.toString();
      node.name = id.toString();
    });
  }
}
