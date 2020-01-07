import PropTypes from "prop-types";
import React from "react";
import { Button, Header, Portal, Segment, Tab } from "semantic-ui-react";
import HighlightNodes from "./HighlightNodes";
import InfoTable from "./InfoTable";


export default class ModuleExplorer extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    setActiveIndex: PropTypes.func.isRequired,
    activeIndex: PropTypes.number.isRequired
  };

  handleTabChange = (e, { activeIndex }) => this.props.setActiveIndex(activeIndex);

  render() {
    const { open, onClose, module, activeIndex, highlightColors } = this.props;

    const styles = {
      segment: {
        position: "fixed",
        maxWidth: "900px",
        width: "900px",
        left: "50px",
        bottom: "50px",
        zIndex: 1000,
        boxShadow: "4px 4px 15px 0px rgba(0,0,0,0.51)"
      }
    };

    const panes = [
      { menuItem: "Info", render: () => <Tab.Pane><InfoTable module={module}/></Tab.Pane> },
      {
        menuItem: "Highlight Nodes",
        render: () => <Tab.Pane><HighlightNodes highlightColors={highlightColors}/></Tab.Pane>
      }
    ];

    return <Portal open={open} onClose={onClose} closeOnDocumentClick={false}>
      <Segment style={styles.segment}>
        <Header>Module Explorer</Header>
        <Tab panes={panes} activeIndex={activeIndex} onTabChange={this.handleTabChange}/>
        <Button negative content="Close" onClick={onClose}/>
      </Segment>
    </Portal>;
  }
}
