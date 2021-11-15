import { useState } from "react";
import { Button, Header, Portal, Segment, Tab } from "semantic-ui-react";
import HighlightNodes from "./HighlightNodes";
import InfoTable from "./InfoTable";

export default function ModuleExplorer({ open, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleTabChange = (e, { activeIndex }) => setActiveIndex(activeIndex);

  return (
    <Portal open={open} onClose={onClose} closeOnDocumentClick={false}>
      <Segment
        style={{
          position: "fixed",
          maxWidth: "900px",
          width: "900px",
          left: "50px",
          bottom: "50px",
          zIndex: 1000,
          boxShadow: "4px 4px 15px 0px rgba(0,0,0,0.51)",
        }}
      >
        <Header>Module Explorer</Header>
        <Tab
          panes={[
            {
              menuItem: "Info",
              render: () => (
                <Tab.Pane>
                  <InfoTable />
                </Tab.Pane>
              ),
            },
            {
              menuItem: "Highlight Nodes",
              render: () => (
                <Tab.Pane>
                  <HighlightNodes />
                </Tab.Pane>
              ),
            },
          ]}
          activeIndex={activeIndex}
          onTabChange={handleTabChange}
        />
        <Button negative content="Close" onClick={onClose} />
      </Segment>
    </Portal>
  );
}
