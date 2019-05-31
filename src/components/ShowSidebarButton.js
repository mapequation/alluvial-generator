import React from "react";
import { Menu, Rail } from "semantic-ui-react";


export default function ShowSidebarButton(props) {
  return <Rail
    internal
    position="right"
    style={{ paddingRight: 0, marginRight: 0, height: 0 }}
  >
    <Menu vertical>
      <Menu.Item
        icon="sidebar"
        content="Show sidebar"
        onClick={props.onClick}
      />
    </Menu>
  </Rail>;
}
