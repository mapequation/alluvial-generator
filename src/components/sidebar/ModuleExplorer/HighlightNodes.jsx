import { readFile } from "@mapequation/infomap/parser";
import { observer } from "mobx-react";
import { useContext, useRef, useState } from "react";
import { Button, Table } from "semantic-ui-react";
import { StoreContext } from "../../../store";

export default observer(function HighlightNodes() {
  const store = useContext(StoreContext);
  const [files, setFiles] = useState([]);
  const input = useRef();
  const { highlightColors } = store;

  const onInputChange = () => {
    const numFiles = files.length;
    const fileInputs = Array.from(input.current.files);

    Promise.all(fileInputs.map(readFile)).then((files) => {
      const newFiles = files.map((file, i) => ({
        name: fileInputs[i].name,
        content: file.split("\n").map((line) => line.trim()),
        highlightIndex: (numFiles + i) % highlightColors.length,
      }));

      setFiles([...files, ...newFiles]);
      store.setHighlightedNodes(files);
    });

    input.value = "";
  };

  const filesLoaded = files.length > 0;

  return (
    <Table celled singleLine compact fixed>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Filename</Table.HeaderCell>
          <Table.HeaderCell>Num. nodes</Table.HeaderCell>
          <Table.HeaderCell>Highlight color</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {!filesLoaded && (
          <Table.Row disabled>
            <Table.Cell content="No files loaded" />
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
        )}
        {files.map((file, i) => (
          <Table.Row key={i}>
            <Table.Cell>{file.name}</Table.Cell>
            <Table.Cell content={file.content.length} />
            <Table.Cell
              style={{ background: highlightColors[file.highlightIndex] }}
            />
          </Table.Row>
        ))}
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
              onChange={onInputChange}
              ref={input}
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
});
