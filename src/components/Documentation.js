import React from "react";
import { Container, Header } from "semantic-ui-react";
import openModuleGif from "./images/open_module.gif";
import closeModuleGif from "./images/close_module.gif";


const Documentation = () =>
  <Container text style={{ padding: "40px 0 100px 0"}}>
    <Header as="h1">Feedback</Header>
    <p>
      If you have any questions, feedback, or issues, please add them to the <a
      href="https://github.com/mapequation/alluvial-generator/issues">GitHub issues page</a>.
    </p>

    <Header as="h1">Instructions</Header>

    <Header>Show sub-modules</Header>
    <p>
      By default, we show the top level modules for each network. To show the sub-modules
      within any module, double click on it. If nothing happens, the module is already expanded
      to its deepest level.
    </p>
    <figure>
      <img src={openModuleGif} alt="Show sub-modules"/>
      <figcaption>Show sub-modules by double clicking a module.</figcaption>
    </figure>

    <Header>Regroup sub-modules</Header>
    <p>
      To regroup sub-modules into top level modules, double click on any sub-module while holding
      the <kbd>shift</kbd> key.
    </p>
    <figure>
      <img src={closeModuleGif} alt="Regroup sub-modules"/>
      <figcaption>To regroup sub-modules, double click a module while holding the <kbd>shift</kbd> key.</figcaption>
    </figure>

    <Header as="h1">Supported formats</Header>
    <p>
      Currently, we support networks clustered by <a href="https://www.mapequation.org/code.html">Infomap</a> into
      the <code>clu</code>, <code>map</code>, <code>tree</code> and <code>ftree</code> formats.
      To get hierarchical modules, you need to use the formats <code>tree</code> or <code>ftree</code>.
    </p>
    <p>
      Read more about Infomap output formats on the <a href="https://www.mapequation.org/code.html#Output">Infomap
      documentation page</a>.
    </p>
  </Container>;

export default Documentation;
