import { getParserForExtension } from "@mapequation/infoparse";
import PropTypes from "prop-types";
import React from "react";
import { Checkbox, Container, Divider, Icon, Segment, Step, Table } from "semantic-ui-react";

import { acceptedFormats, getParser, isValidExtension } from "../io/object-parser";
import readAsText from "../io/read-as-text";
import withDraggable from "./withDraggable";


function humanFileSize(bytes) {
  const thresh = 1000;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  const units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

const fileExtension = filename => {
  const index = filename.lastIndexOf(".");
  if (index === -1 || index + 1 === filename.length) return "";
  return filename.substring(index + 1).toLowerCase();
};

const DraggableTableRow = withDraggable(Table.Row);

export default class LoadNetworks extends React.Component {
  state = {
    files: [],
    loading: false,
    useNodeIds: false
  };

  static propTypes = {
    onSubmit: PropTypes.func
  };

  static defaultProps = {
    onSubmit: values => console.log(values)
  };

  onUseNodeIdsChange = () => this.setState((prevState) => ({ useNodeIds: !prevState.useNodeIds }));

  withLoadingState = callback => () =>
    this.setState({ loading: true }, () => setTimeout(callback, 50));

  loadSelectedFiles = () => {
    const validFiles = [];

    for (let file of this.input.files) {
      const extension = fileExtension(file.name);
      if (isValidExtension(extension) || extension === "json") {
        file.format = extension;
        validFiles.push(file);
      } else {
        console.error(`Invalid format for file ${file.name}`);
      }
    }

    this.input.value = "";

    Promise.all(validFiles.map(readAsText))
      .then(files => {
        const newFiles = files.map((file, i) => ({
          contents: file,
          name: validFiles[i].name,
          size: validFiles[i].size,
          format: validFiles[i].format,
          error: false
        }));

        this.setState(({ files }) => ({
          files: [...files, ...newFiles],
          loading: false
        }));
      });
  };

  parseNetworks = () => {
    const { files, useNodeIds } = this.state;
    const { onSubmit } = this.props;

    const hasJson = files.some(file => file.format === "json");

    if (hasJson) {
      if (files.length > 1) {
        files.forEach(file => {
          if (file.format !== "json") {
            file.error = true;
          }
        });
        this.setState({ loading: false });
        return;
      }
      const json = JSON.parse(files[0].contents);
      onSubmit(json);
      return;
    }

    const networks = files.map((file, i) => {
      try {
        const parseLinks = false;
        const lines = file.contents.split("\n").filter(Boolean);
        const object = getParserForExtension(file.format)(lines, parseLinks);
        const objectParser = getParser(file.format);
        const parsed = objectParser(object, file.name, useNodeIds);

        // names must be unique
        const uniqueNames = new Set();
        parsed.nodes.forEach(node => {
          if (uniqueNames.has(node.name)) {
            throw new Error(`Network contains nodes with duplicate names: "${node.name}"`);
          }
          uniqueNames.add(node.name);
        });

        return parsed;
      } catch (e) {
        files[i].error = true;
        console.warn(e);
        return null;
      }
    });

    if (files.some(file => file.error)) {
      this.setState({ loading: false });
      return;
    }

    onSubmit({ networks });
  };

  loadExample = () => {
    const { onSubmit } = this.props;

    const filename = "science-1998-2001-2007.json";

    fetch(`./data/${filename}`)
      .then(res => res.json())
      .then(onSubmit)
      .catch(err => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  removeFile = index =>
    this.setState(({ files }) => {
      files.splice(index, 1);
      const hasJson = files.some(file => file.format === "json");
      if (!hasJson) {
        files.forEach(file => file.error = false);
      }
      return { files };
    });

  moveRow = (toIndex, fromIndex) =>
    this.setState(state => {
      const { files } = state;
      const file = files[fromIndex];
      files.splice(fromIndex, 1);
      files.splice(toIndex, 0, file);
      return { files };
    });

  render() {
    const { files, loading, useNodeIds } = this.state;

    return (
      <Segment
        as={Container}
        loading={loading}
        text
        textAlign="center"
        style={{ padding: "50px 100px" }}
      >
        <Step.Group>
          <Step link onClick={this.withLoadingState(this.loadExample)}>
            <Icon name="book"/>
            <Step.Content>
              <Step.Title>Load example</Step.Title>
              <Step.Description>Citation networks</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        <Divider horizontal style={{ margin: "20px 0px 30px 0px" }} content="Or"/>

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
              <Step.Description>clu, map, tree, ftree, json</Step.Description>
            </Step.Content>
            <input
              style={{ display: "none" }}
              type="file"
              multiple
              id="upload"
              onChange={this.withLoadingState(this.loadSelectedFiles)}
              accept={acceptedFormats + ",.json"}
              ref={input => (this.input = input)}
            />
          </Step>
          <Step
            link
            active={files.length > 0}
            disabled={files.length === 0}
            onClick={this.withLoadingState(this.parseNetworks)}
          >
            <Step.Content>
              <Step.Title>Create diagram</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <Checkbox label="Use node ids as identifiers" checked={useNodeIds} onChange={this.onUseNodeIdsChange}/>

        {files.length > 0 &&
        <Table celled singleLine fixed unstackable striped size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell width={3}>Size</Table.HeaderCell>
              <Table.HeaderCell width={3}>Format</Table.HeaderCell>
              <Table.HeaderCell width={3}>Remove</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {files.map((file, i) =>
              <DraggableTableRow
                key={i}
                draggable
                className="draggable"
                index={i}
                action={this.moveRow}
              >
                <Table.Cell style={{ cursor: "grab" }} error={file.error}>{file.name}</Table.Cell>
                <Table.Cell>{humanFileSize(file.size)}</Table.Cell>
                <Table.Cell>{file.format}</Table.Cell>
                <Table.Cell
                  selectable
                  negative
                  style={{ cursor: "pointer" }}
                  onClick={() => this.removeFile(i)}
                >
                  <a>Remove</a>
                </Table.Cell>
              </DraggableTableRow>
            )}
          </Table.Body>
        </Table>
        }
      </Segment>
    );
  }
}
