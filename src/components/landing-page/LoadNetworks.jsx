import {
  extension as fileExtension,
  parse,
  readFile,
} from "@mapequation/infomap/parser";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import {
  Button,
  Card,
  CardContent,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/material";
import { animate, Reorder, useMotionValue } from "framer-motion";
import { observer } from "mobx-react";
import { useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { StoreContext } from "../../store";
import humanFileSize from "../../utils/human-file-size";
import id from "../../utils/id";
import "./LoadNetworks.css";

const acceptedFormats = [".tree", ".ftree", ".clu", ".json"].join(",");

export default observer(function LoadNetworks({ onClose }) {
  const store = useContext(StoreContext);
  const [files, setFiles] = useState(store.files);

  const { open, getRootProps, getInputProps } = useDropzone({
    noClick: true,
    accept: acceptedFormats,
    onDrop: async (acceptedFiles) => {
      console.time("onDrop");
      const readFiles = await Promise.all(acceptedFiles.map(readFile));
      const newFiles = [];

      for (let i = 0; i < acceptedFiles.length; ++i) {
        const file = acceptedFiles[i];
        const format = fileExtension(file.name);

        let contents = null;

        if (format === "json") {
          try {
            contents = JSON.parse(readFiles[i]);

            if (contents.networks != undefined) {
              // a diagram contains several networks
              // duplicate file for each network
              newFiles.push(...createFilesFromDiagramObject(contents, file));
              continue;
            }
          } catch (e) {
            console.error(e);
            continue;
          }
        } else {
          contents = parse(readFiles[i]);
        }

        if (!contents) {
          console.error(`Could not parse ${file.name}`);
          continue;
        }

        file.contents = contents;
        file.id = id();
        file.format = format;
        newFiles.push(file);
      }

      console.log(newFiles);
      setFiles([...files, ...newFiles]);
      console.timeEnd("onDrop");
    },
  });

  const createDiagram = () => {
    console.time("createDiagram");
    const networks = [];

    const stateOrNodeId = (node) =>
      node.stateId != null ? node.stateId : node.id;

    files.forEach((file) => {
      if (file.format === "json") {
        file.contents.nodes.forEach((node) => {
          node.identifier = node.identifier ?? stateOrNodeId(node).toString();
        });
      } else if (file.format === "tree" || file.format === "ftree") {
        file.contents.nodes.forEach((node) => {
          node.identifier = stateOrNodeId(node).toString();
        });
      } else if (file.format === "clu") {
        file.contents.nodes.forEach((node) => {
          const id = stateOrNodeId(node);
          node.path = node.moduleId.toString();
          node.identifier = id.toString();
          node.name = id.toString();
        });
      }

      networks.push({
        id: file.id,
        name: file.name,
        ...file.contents,
      });
    });

    store.setFiles(files);
    store.setNetworks(networks);
    onClose();
    console.timeEnd("createDiagram");
  };

  const loadExample = async () => {
    console.time("loadExample");
    const filename = "science-1998-2001-2007.json";

    try {
      const res = await fetch(`/alluvial/data/${filename}`);
      const json = await res.json();

      const emptyFile = new File([], filename);
      const files = createFilesFromDiagramObject(json, emptyFile);
      store.setFiles(files);
      store.setNetworks(json.networks);
      onClose();
    } catch (e) {
      console.error(e);
    }
    console.timeEnd("loadExample");
  };

  const removeFileId = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
  };

  return (
    <>
      <DialogTitle>Load network partitions</DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={files.length > 0 ? 2 : 1}
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
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={loadExample}>
          Load Example
        </Button>
        <Button
          variant="outlined"
          disabled={files.length === 0}
          onClick={() => setFiles([])}
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

          <Text>{humanFileSize(file.size)}</Text>
          {file.contents?.nodes && (
            <Text>{file.contents.nodes.length} nodes</Text>
          )}
          {file.contents?.numTopModules && (
            <Text>{file.contents.numTopModules} top modules</Text>
          )}
          {file.contents?.numLevels && (
            <Text>{file.contents.numLevels} levels</Text>
          )}
          {file.contents?.codelength && (
            <Text>{file.contents.codelength.toFixed(3)} bits</Text>
          )}
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

const inactiveShadow = "0px 1px 4px rgba(0, 0, 0, 0.16)";

function useRaisedShadow(value) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;
    value.onChange((latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });
  }, [value, boxShadow]);

  return boxShadow;
}

function createFilesFromDiagramObject(json, file) {
  // to divide size between networks in file
  const totNodes =
    json.networks
      .map((network) => network.nodes.length)
      .reduce((tot, b) => tot + b, 0) || 1;

  return json.networks.map((network) => ({
    ...file,
    lastModified: file.lastModified,
    size: (file.size * network.nodes.length) / totNodes,
    name: network.name,
    id: network.id,
    contents: network,
    format: "json",
  }));
}
