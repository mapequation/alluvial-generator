import React from "react";
import { Header, Image } from "semantic-ui-react";


export default function MenuHeader() {
  return <Header>
    <Image
      size="mini"
      verticalAlign="middle"
      src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg"
      alt="mapequation-icon"
    />
    <div className="content">
      <span className="brand">
        <span className="brand-infomap">Alluvial Diagram</span> <span className="brand-nn">Generator</span>
      </span>
    </div>
  </Header>;
}
