import React from "react";
import { Label, Popup } from "semantic-ui-react";


export default class LabelForSlider extends React.PureComponent {
  render() {
    const { children, popup, ...rest } = this.props;

    const label = <Label
      basic
      horizontal
      {...rest}
      style={{ width: "50%", textAlign: "left", fontWeight: 400, float: "left", margin: "0.08em 0" }}
    />;

    return (
      <div style={{ clear: "both" }}>
        {popup ? <Popup content={popup} inverted size="small" trigger={label}/> : label}
        <div style={{ width: "50%", display: "inline-block", float: "right" }}>
          {children}
        </div>
      </div>
    );
  }
}
