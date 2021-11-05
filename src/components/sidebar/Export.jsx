import React from "react";
import { Header, Menu } from "semantic-ui-react";


export default class Export extends React.PureComponent {
  render() {
    const { onSaveClick, onDownloadSvgClick, onDownloadPngClick, onConvertToPdfClick } = this.props;

    return <>
      <Header as="h4">Export</Header>
      <Menu.Menu>
        <Menu.Item icon="download" onClick={onSaveClick} content="Save diagram"/>
      </Menu.Menu>
      <Menu.Menu>
        <Menu.Item icon="download" onClick={onDownloadSvgClick} content="Download SVG"/>
      </Menu.Menu>
      <Menu.Menu>
        <Menu.Item icon="image" onClick={onDownloadPngClick} content="Download PNG"/>
      </Menu.Menu>
      <Menu.Menu>
        <Menu.Item icon="help" onClick={onConvertToPdfClick} content="Converting to PDF"/>
      </Menu.Menu>
    </>;
  }
}
