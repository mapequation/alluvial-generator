//import * as Sentry from "@sentry/browser";
import PropTypes from "prop-types";
import { Component } from "react";
import {
  Checkbox,
  Container,
  Divider,
  Form,
  Icon,
  Label,
  Popup,
  Segment,
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
//import Background from "../../images/background.svg";
import { getParserForExtension } from "../../io/text-parser";
import {
  extension as fileExtension,
  readFile,
} from "@mapequation/infomap/parser";
import humanFileSize from "../../utils/humanFileSize";
import makeDraggable from "./Draggable";

const DraggableTableRow = makeDraggable(Table.Row);

export default class LoadNetworks extends Component {
  state = {
    files: [],
    loading: false,
    nodeIdentifier: "name",
  };

  static propTypes = {
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    onSubmit: (values) => console.log(values),
  };

  onNodeIdentifierChange = (_, { value }) =>
    this.setState({ nodeIdentifier: value });

  // toggleMultilayer = (i) =>
  //   this.setState((prevState) => {
  //     const file = prevState.files[i];
  //     if (!file) return;
  //     file.multilayer = !file.multilayer;

  //     // Switch to using id as node identifier if only one file set to multilayer
  //     if (i === 0 && prevState.files.length === 1 && file.multilayer) {
  //       return { files: prevState.files, nodeIdentifier: "id" };
  //     }

  //     return { files: prevState.files };
  //   });

  withLoadingState = (callback) => () =>
    this.setState({ loading: true }, () => setTimeout(callback, 50));

  loadSelectedFiles = () => {
    const validFiles = [];

    for (let file of this.input.files) {
      const extension = fileExtension(file.name);
      if (isValidExtension(extension)) {
        file.format = extension;
        validFiles.push(file);
      } else {
        alert(`Invalid format for file ${file.name}`);
        console.error(`Invalid format for file ${file.name}`);
      }
    }

    this.input.value = "";

    Promise.all(validFiles.map(readFile))
      .then((files) => {
        const newFiles = files.map((file, i) => ({
          contents: file,
          name: validFiles[i].name,
          size: validFiles[i].size,
          format: validFiles[i].format,
          //multilayer: false,
          error: false,
          errorMessage: null,
        }));

        this.setState(({ files }) => ({
          files: [...files, ...newFiles],
          loading: false,
        }));
      })
      .catch((err) => {
        console.log(err);
        //Sentry.captureException(err);
      });
  };

  createDiagram = () => {
    const { files, nodeIdentifier } = this.state;
    const { onSubmit } = this.props;

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
        this.setState({ loading: false });
        return;
      }

      const json = JSON.parse(files[0].contents);
      setIdentifiersInJsonFormat(json);
      onSubmit(json);
      return;
    }

    const networks = [];

    files.forEach((file, i) => {
      const lines = file.contents.split("\n").filter(Boolean);
      const parser = getParserForExtension(file.format);
      const object = parser(lines);
      console.log(lines, object);

      // If we found an error before, and switched to using node ids now, we need to reset any errors
      file.error = false;
      file.errorMessage = null;

      try {
        // If we only load one file that is set to multilayer, visualize each layer as a network
        // if (
        //   files.length === 1 &&
        //   file.multilayer &&
        //   (file.format === "tree" || file.format === "ftree")
        // ) {
        //   const objectParser = getParser("multilevelTree");
        //   const parsed = objectParser(object, file.name, nodeIdentifier);

        //   if (nodeIdentifier === "name") {
        //     for (let network of parsed) {
        //       checkNameConflicts(network.nodes, file);
        //     }
        //   }

        //   networks.push(...parsed);
        //   return;
        // }

        const objectParser = getParser(file.format);
        const parsed = objectParser(
          object,
          file.name,
          nodeIdentifier
          //file.multilayer
        );
        console.log(parsed);

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

    if (files.some((file) => file.error)) {
      this.setState({ loading: false });
      return;
    }

    onSubmit({ networks });
  };

  loadExample = () => {
    const { onSubmit } = this.props;

    const filename = "science-1998-2001-2007.json";

    fetch(`/alluvial/data/${filename}`)
      .then((res) => res.json())
      .then(setIdentifiersInJsonFormat)
      .then(onSubmit)
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
        //Sentry.captureException(err);
      });
  };

  removeFile = (index) =>
    this.setState(({ files }) => {
      files.splice(index, 1);
      const hasJson = files.some((file) => file.format === "json");
      if (!hasJson) {
        // If we removed the json file, reset the error
        files.forEach((file) => (file.error = false));
      }
      return { files };
    });

  moveRow = (toIndex, fromIndex) =>
    this.setState((state) => {
      const { files } = state;
      const file = files[fromIndex];
      files.splice(fromIndex, 1);
      files.splice(toIndex, 0, file);
      return { files };
    });

  render() {
    const { files, loading, nodeIdentifier } = this.state;

    const background = {
      padding: "100px 0 100px 0",
      background: `linear-gradient(hsla(0, 0%, 100%, 0.8), hsla(0, 0%, 100%, 0.7))`,
      backgroundSize: "115% auto",
      backgroundPosition: "20% 20%",
    };

    return (
      <div style={background}>
        <Segment
          as={Container}
          loading={loading}
          text
          textAlign="center"
          style={{ padding: "50px 50px" }}
        >
          <Label attached="top right">v {process.env.REACT_APP_VERSION}</Label>
          <Step.Group>
            <Step link onClick={this.withLoadingState(this.loadExample)}>
              <Icon name="book" />
              <Step.Content>
                <Step.Title>Load example</Step.Title>
                <Step.Description>Citation networks</Step.Description>
              </Step.Content>
            </Step>
          </Step.Group>

          <Divider
            horizontal
            style={{ margin: "20px 0px 30px 0px" }}
            content="Or"
          />

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
                <Step.Description>
                  {validExtensions.join(", ")}
                </Step.Description>
              </Step.Content>
              <input
                style={{ display: "none" }}
                type="file"
                multiple
                id="upload"
                onChange={this.withLoadingState(this.loadSelectedFiles)}
                accept={acceptedFormats}
                ref={(input) => (this.input = input)}
              />
            </Step>
            <Step
              link
              active={files.length > 0}
              disabled={files.length === 0}
              onClick={this.withLoadingState(this.createDiagram)}
            >
              <Step.Content>
                <Step.Title>Create diagram</Step.Title>
              </Step.Content>
            </Step>
          </Step.Group>

          <Form>
            <Form.Field>
              Node identifier
              <Popup trigger={<Icon name="question" />} inverted>
                <p>
                  Two nodes in different networks are considered equal if their
                  names are the same. For this to work, all nodes in a network
                  must have unique names.
                </p>
                <p>
                  If a network does not have unique names, you can try to use
                  node ids as identifiers, which uses the node ids to determine
                  if two nodes are equal.
                </p>
              </Popup>
            </Form.Field>
            <Form.Field>
              <Checkbox
                radio
                label="Node name"
                name="nodeIdentifier"
                value="name"
                checked={nodeIdentifier === "name"}
                onChange={this.onNodeIdentifierChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                radio
                label="Node id"
                name="nodeIdentifier"
                value="id"
                checked={nodeIdentifier === "id"}
                onChange={this.onNodeIdentifierChange}
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
                  {/* <Table.HeaderCell>Multilayer</Table.HeaderCell> */}
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
                      action={this.moveRow}
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
                      {/* <Table.Cell>
                        <Checkbox
                          checked={file.multilayer}
                          onChange={() => this.toggleMultilayer(i)}
                        />
                      </Table.Cell> */}
                      <Table.Cell
                        selectable
                        textAlign="center"
                        style={{ cursor: "pointer" }}
                        onClick={() => this.removeFile(i)}
                      >
                        <Icon name="x" />
                      </Table.Cell>
                    </DraggableTableRow>
                  </Transition>
                ))}
              </Table.Body>
            </Table>
          )}
        </Segment>
      </div>
    );
  }
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
