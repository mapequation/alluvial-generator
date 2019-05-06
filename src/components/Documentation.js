import React from "react";
import { Container, Divider, Header, Image } from "semantic-ui-react";
import openModuleGif from "./images/open_module.gif";
import closeModuleGif from "./images/close_module.gif";


const Documentation = () =>
  <Container text style={{ padding: "40px 0 100px 0" }}>
    <Header as="h1">Feedback</Header>
    <p>
      If you have any questions, feedback, or issues, please add them to the <a
      href="https://github.com/mapequation/alluvial-generator/issues">GitHub issues page</a>.
    </p>

    <Header as="h1">Instructions</Header>

    <p>
      Networks are shown as vertical stacks of modules. To highlight change between networks, we draw
      streamines between the networks. To tell which sub-modules that have the same parent module, we draw
      them closer together than other modules in the same network.
    </p>

    <Header>Navigation</Header>
    <p>
      Zoom in and out by scrolling. Pan the diagram by clicking and dragging.
      To show module information, click on any module.
    </p>

    <Header>Show sub-modules</Header>
    <Image src={openModuleGif} alt="Show sub-modules" centered bordered rounded size="medium" floated="right"/>
    <p>
      By default, we show the top level modules for each network. To show the sub-modules
      within any module, double click on it. If nothing happens, the module is already expanded
      to its deepest level.
    </p>
    <p>
      To keep the heights proportional to the contained flow, we re-scale the heights of all other modules.
    </p>

    <Divider hidden clearing/>

    <Header clear="both">Regroup sub-modules</Header>
    <Image src={closeModuleGif} alt="Regroup sub-modules" centered bordered rounded size="medium" floated="right"/>
    <p>
      To regroup sub-modules into their parent module, double click on any sub-module while holding
      the <kbd>shift</kbd> key.
    </p>
    <p>
      All modules with the same parent will be re-grouped into the parent module.
    </p>

    <Divider hidden clearing/>

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
