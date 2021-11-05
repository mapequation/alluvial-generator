import { Button, Header, List, Modal } from "semantic-ui-react";

export default function ConvertToPdfModal({ open, onClose }) {
  return (
    <Modal size="small" dimmer="inverted" open={open} onClose={onClose}>
      <Modal.Header>Converting to PDF</Modal.Header>
      <Modal.Content>
        <p>
          The easiest way to convert to PDF is to download the diagram as SVG
          and convert from SVG to PDF.
        </p>

        <Header as="h3">How to convert SVG to PDF</Header>
        <List ordered>
          <List.Item>Download the diagram as SVG</List.Item>
          <List.Item>Open the SVG in your browser</List.Item>
          <List.Item>
            Open the <i>print dialog</i> (Ctrl-P on Windows, &#8984;P on Mac)
          </List.Item>
          <List.Item>
            Choose <i>Print to PDF</i>
          </List.Item>
        </List>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
}
