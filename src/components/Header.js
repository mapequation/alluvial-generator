import React from "react";
import "./Header.css";


const Header = () => (
  <header className="documentation">
    <div className="ui container">
      <div className="menu">
        <div>
          <h1 className="ui header">
            <a href="http://www.mapequation.org">
              <img className="mapequation-logo"
                   src="//www.mapequation.org/assets/img/twocolormapicon_whiteboarder.svg" alt="mapequation-icon"/>
            </a>
            <div className="content">
              <span className="brand">
                  <span className="brand-infomap">Alluvial Diagram</span> <span className="brand-nn">Generator</span>
              </span>
              <div className="sub header">Interactive mapping of change in hierarchical networks</div>
            </div>
          </h1>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
