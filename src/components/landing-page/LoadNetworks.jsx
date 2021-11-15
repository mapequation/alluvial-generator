import {
  extension as fileExtension,
  readFile,
} from "@mapequation/infomap/parser";
import { useRef, useState } from "react";
import {
  Checkbox,
  Form,
  Icon,
  Popup,
  Step,
  Table,
  Transition,
} from "semantic-ui-react";
import {
  acceptedFormats,
  getParser,
  isValidExtension,
  validExtensions,
} from "../../io/object-parser";
import { getParserForExtension } from "../../io/text-parser";
import humanFileSize from "../../utils/human-file-size";
import makeDraggable from "./Draggable";

const DraggableTableRow = makeDraggable(Table.Row);

export default function LoadNetworks({ onSubmit }) {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nodeIdentifier, setNodeIdentifier] = useState("name");
  const input = useRef(null);

  const loadSelectedFiles = () => {
    setIsLoading(true);
    const validFiles = [];

    for (let file of input.current.files) {
      const extension = fileExtension(file.name);
      if (isValidExtension(extension)) {
        file.format = extension;
        validFiles.push(file);
      } else {
        alert(`Invalid format for file ${file.name}`);
        console.error(`Invalid format for file ${file.name}`);
      }
    }

    input.current.value = "";

    Promise.all(validFiles.map(readFile))
      .then((fs) => {
        const newFiles = fs.map((file, i) => ({
          contents: file,
          name: validFiles[i].name,
          size: validFiles[i].size,
          format: validFiles[i].format,
          error: false,
          errorMessage: null,
        }));

        setFiles([...files, ...newFiles]);
      })
      .catch((err) => console.error(err));

    setIsLoading(false);
  };

  const createDiagram = () => {
    setIsLoading(true);

    const hasJson = files.some((file) => file.format === "json");

    if (hasJson) {
      // A JSON file represents a complete diagram, only allow one file
      // TODO: we should support adding new networks
      if (files.length > 1) {
        files.forEach((file) => {
          if (file.format !== "json") {
            file.error = true;
            file.errorMessage =
              "When a json file is present, all other files must be removed.";
          }
        });
        setIsLoading(false);
        return;
      }

      const json = JSON.parse(files[0].contents);
      setIdentifiersInJsonFormat(json);
      onSubmit(json);
      return;
    }

    const networks = [];

    console.time("parse");
    files.forEach((file, i) => {
      const lines = file.contents.split("\n").filter(Boolean);
      const parser = getParserForExtension(file.format);
      const object = parser(lines);

      // If we found an error before, and switched to using node ids now, we need to reset any errors
      file.error = false;
      file.errorMessage = null;

      try {
        const objectParser = getParser(file.format);
        const parsed = objectParser(
          object,
          file.name,
          nodeIdentifier
          //file.multilayer
        );

        // If we use node name as identifier, all names must be unique
        if (nodeIdentifier === "name") {
          checkNameConflicts(parsed.nodes, file);
        }

        networks.push(parsed);
      } catch (e) {
        files[i].error = true;
        console.warn(e);
      }
    });
    console.timeEnd("parse");

    if (files.some((file) => file.error)) {
      setIsLoading(false);
      return;
    }

    onSubmit({ networks });
  };

  const loadExample = () => {
    setIsLoading(true);

    const filename = "science-1998-2001-2007.json";

    fetch(`/alluvial/data/${filename}`)
      .then((res) => res.json())
      .then(setIdentifiersInJsonFormat)
      .then(onSubmit)
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        //Sentry.captureException(err);
      });
  };

  const removeFile = (index) => {
    files.splice(index, 1);
    const hasJson = files.some((file) => file.format === "json");
    if (!hasJson) {
      // If we removed the json file, reset the error
      files.forEach((file) => (file.error = false));
    }
    setFiles(files);
  };

  const moveRow = (toIndex, fromIndex) => {
    const file = files[fromIndex];
    files.splice(fromIndex, 1);
    files.splice(toIndex, 0, file);
    setFiles(files);
  };

  return (
    <>
      <Step.Group>
        <Step link onClick={loadExample}>
          <Icon name="book" />
          <Step.Content>
            <Step.Title>Load example</Step.Title>
            <Step.Description>Citation networks</Step.Description>
          </Step.Content>
        </Step>
      </Step.Group>

      <Step.Group ordered>
        <Step
          as="label"
          link
          completed={files.length > 0}
          active={files.length === 0}
          htmlFor="upload"
        >
          <Step.Content>
            <Step.Title>Add networks</Step.Title>
            <Step.Description>{validExtensions.join(", ")}</Step.Description>
          </Step.Content>
          <input
            style={{ display: "none" }}
            type="file"
            multiple
            id="upload"
            onChange={loadSelectedFiles}
            accept={acceptedFormats}
            ref={input}
          />
        </Step>
        <Step
          link
          active={files.length > 0}
          disabled={files.length === 0}
          onClick={createDiagram}
        >
          <Step.Content>
            <Step.Title>Create diagram</Step.Title>
          </Step.Content>
        </Step>
      </Step.Group>

      <Form>
        <Form.Field>Node identifier</Form.Field>
        <Form.Field>
          <Checkbox
            radio
            label="Node name"
            name="nodeIdentifier"
            value="name"
            checked={nodeIdentifier === "name"}
            onChange={(_, { value }) => setNodeIdentifier(value)}
          />
        </Form.Field>
        <Form.Field>
          <Checkbox
            radio
            label="Node id"
            name="nodeIdentifier"
            value="id"
            checked={nodeIdentifier === "id"}
            onChange={(_, { value }) => setNodeIdentifier(value)}
          />
        </Form.Field>
      </Form>

      {files.length > 0 && (
        <Table celled unstackable striped size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Size</Table.HeaderCell>
              <Table.HeaderCell>Format</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {files.map((file, i) => (
              <Transition
                key={i}
                animation="shake"
                duration={700}
                visible={!file.error}
              >
                <DraggableTableRow
                  draggable
                  className="draggable"
                  index={i}
                  action={moveRow}
                >
                  <Table.Cell style={{ cursor: "grab" }} error={file.error}>
                    {file.name}
                    {file.error && (
                      <Popup
                        inverted
                        content={file.errorMessage}
                        trigger={
                          <Icon
                            name="warning sign"
                            style={{ float: "right", cursor: "pointer" }}
                          />
                        }
                      />
                    )}
                  </Table.Cell>
                  <Table.Cell>{humanFileSize(file.size)}</Table.Cell>
                  <Table.Cell>{file.format}</Table.Cell>
                  <Table.Cell
                    selectable
                    textAlign="center"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeFile(i)}
                  >
                    <Icon name="x" />
                  </Table.Cell>
                </DraggableTableRow>
              </Transition>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
}

function checkNameConflicts(nodes, file) {
  const uniqueNames = new Set();
  nodes.forEach((node) => {
    if (uniqueNames.has(node.name)) {
      const message = `Nodes with duplicate names found: "${node.name}". Try using node ids as identifiers.`;
      file.errorMessage = message;
      throw new Error(message);
    }
    uniqueNames.add(node.name);
  });
}

function setIdentifiersInJsonFormat(json) {
  if (json.version) {
    const version = json.version.split(".").map(Number);
    const [major, minor] = version;
    if (major === 0 && minor < 3) {
      for (let network of json.networks) {
        for (let node of network.nodes) {
          // "node.name" was the only supported identifier before version 0.3.0
          node.identifier = node.name;
        }
      }
    }
  }

  return json;
}
