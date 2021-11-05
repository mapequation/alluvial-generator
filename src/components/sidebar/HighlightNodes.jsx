import PropTypes from "prop-types";
import React from "react";
import { Button, Table } from "semantic-ui-react";
import Dispatch from "../../context/Dispatch";
import readAsText from "../../io/read-as-text";


export default class HighlightNodes extends React.Component {
  static contextType = Dispatch;

  static propTypes = {
    highlightColors: PropTypes.arrayOf(PropTypes.string)
  };

  state = {
    files: []
  };

  onInputChange = () => {
    const { highlightColors } = this.props;
    const { dispatch } = this.context;

    const numFiles = this.state.files.length;

    const fileInputs = Array.from(this.input.files);

    Promise.all(fileInputs.map(readAsText))
      .then(files => {
        const newFiles = files.map((file, i) => ({
          name: fileInputs[i].name,
          content: file.split("\n").map(line => line.trim()),
          highlightIndex: (numFiles + i) % highlightColors.length
        }));

        this.setState(({ files }) => ({ files: [...files, ...newFiles] }),
          () => dispatch({ type: "highlightNodes", value: this.state.files }));
      });

    this.input.value = "";
  };

  render() {
    const { highlightColors } = this.props;
    const { files } = this.state;

    const filesLoaded = files.length > 0;

    return <Table celled singleLine compact fixed>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Filename</Table.HeaderCell>
          <Table.HeaderCell>Num. nodes</Table.HeaderCell>
          <Table.HeaderCell>Highlight color</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {!filesLoaded &&
        <Table.Row disabled>
          <Table.Cell content="No files loaded"/>
          <Table.Cell/>
          <Table.Cell/>
        </Table.Row>
        }
        {files.map((file, i) =>
          <Table.Row key={i}>
            <Table.Cell>{file.name}</Table.Cell>
            <Table.Cell content={file.content.length}/>
            <Table.Cell style={{ background: highlightColors[file.highlightIndex] }}/>
          </Table.Row>
        )}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan="3">
            <Button
              as="label"
              compact
              size="small"
              icon="plus"
              content="Add file"
              htmlFor="files"
            />
            <input
              style={{ display: "none" }}
              type="file"
              multiple
              id="files"
              onChange={this.onInputChange}
              ref={input => this.input = input}
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>;
  }
}
