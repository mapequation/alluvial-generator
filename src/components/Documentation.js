import React from "react";
import { Container, Grid, Header, Icon } from "semantic-ui-react";
import expandModuleMov from "../images/expand.mov";
import regroupModuleMov from "../images/regroup.mov";


const videoProps = { autoPlay: true, loop: true, className: "ui", width: 400, height: 300 };

const Documentation = () =>
  <Container style={{ padding: "40px 0 100px 0" }}>
    <Grid columns={2}>
      <Grid.Column>
        <Header as="h1">Instructions</Header>
        <p>
          Networks are shown as vertical stacks of modules. To highlight change between networks, we draw streamlines
          between the networks. Sub-modules that have the same parent module are drawn closer together than other
          modules in the same network.
        </p>

        <Header>Limitations</Header>
        <p>
          Two nodes in different networks are considered equal if their names are the same. For this to work, all nodes
          in a network must have unique names.
        </p>

        <Header>Navigation</Header>
        <p>
          Zoom in and out by scrolling. Pan the diagram by clicking and dragging. To show module information, click on
          any module.
        </p>

        <Header>Show sub-modules</Header>
        <video {...videoProps}>
          <source src={expandModuleMov} type="video/mp4"/>
        </video>
        <p>
          By default, we show the top level modules for each network. To show the sub-modules within any module, double
          click on it. If the modules shakes back and forth, the module is already expanded to its deepest level.
        </p>
        <p>
          To keep the heights proportional to the contained flow, we re-scale the heights of all other modules.
        </p>

        <Header>Regroup sub-modules</Header>
        <video {...videoProps}>
          <source src={regroupModuleMov} type="video/mp4"/>
        </video>
        <p>
          To regroup sub-modules into their parent module, double click on any sub-module while holding
          the <kbd>shift</kbd> key.
        </p>
        <p>
          All modules with the same parent will be re-grouped into the parent module.
        </p>
      </Grid.Column>
      <Grid.Column>
        <Header as="h1">Feedback</Header>
        <p>
          If you have any questions, suggestions or issues regarding the software, please add them to <a
          href="https://github.com/mapequation/alluvial-generator/issues"><Icon name="github"/>GitHub
          issues</a>.
        </p>

        <Header as="h1">References</Header>
        <p>
          If you are using the software at mapequation.org in one of your research articles or otherwise want to refer
          to it, please cite <a href="https://www.mapequation.org/publications.html">relevant publication</a> or use the
          following format:
        </p>
        <p>
          D. Edler, A. Eriksson and M. Rosvall, The MapEquation software package,
          available online at <a href="https://www.mapequation.org">mapequation.org</a>.
        </p>

        <Header as="h1">Supported formats</Header>
        <p>
          Currently, we support networks clustered by <a href="https://www.mapequation.org/code.html">Infomap</a> into
          the <code>clu</code>, <code>map</code>, <code>tree</code> and <code>ftree</code> formats.
          To get hierarchically nested modules, you need to use the formats <code>tree</code> or <code>ftree</code>.
        </p>
        <p>
          Infomap is available as a <a href="https://www.mapequation.org/code.html">stand-alone</a> C++ application
          and on the web as <a href="https://www.mapequation.org/infomap">Infomap Online</a>.
        </p>
        <p>
          Read more about Infomap output formats on the <a href="https://www.mapequation.org/code.html#Output">Infomap
          documentation page</a>.
        </p>
      </Grid.Column>
    </Grid>
  </Container>;

export default Documentation;
