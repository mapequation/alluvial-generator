import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import { Popup } from "semantic-ui-react";


export default function DefaultHighlightColor(props) {
  const { defaultHighlightColor, onChange } = props;

  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState(defaultHighlightColor);

  const handleChange = color => {
    setColor(color.hex);
    onChange(color.hex);
  };

  useEffect(() => {
    setColor(defaultHighlightColor);
  }, [defaultHighlightColor]);

  const styles = {
    color: {
      width: "13px",
      height: "13px",
      borderRadius: "2px",
      background: color
    },
    swatch: {
      padding: "2px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer"
    },
    popover: {
      position: "absolute",
      zIndex: "2"
    },
    cover: {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px"
    },
    label: {
      paddingLeft: "9px",
      verticalAlign: "top"
    }
  };

  return (
    <div className="ui checkbox">
      <div style={styles.swatch} onClick={() => setVisible(!visible)}>
        <div style={styles.color}/>
      </div>
      <Popup
        inverted
        size="small"
        trigger={<span style={styles.label}>Default color</span>}
        content="Choose the default diagram color."
      />
      {visible &&
      <div style={styles.popover}>
        <div style={styles.cover} onClick={() => setVisible(false)}/>
        <SketchPicker
          disableAlpha
          color={color}
          onChangeComplete={handleChange}
          presetColors={[
            "#C27F87", "#DDBF8D", "#D0CA92", "#AE927A", "#A7CB81", "#64764F", "#D599E1", "#D4A2FF",
            "#A0BFE4", "#A6CBC1", "#BAD0A1", "#b6b69f", "#414141", "#808080", "#BFBFBF"
          ]}
        />
      </div>
      }
    </div>
  );
}
