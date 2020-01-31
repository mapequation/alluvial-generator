import React from "react";
import { Container, Grid, Header, Icon, List } from "semantic-ui-react";
import compareSvg from "../../images/compare.svg";
import expandModuleMov from "../../images/expand.mov";
import regroupModuleMov from "../../images/regroup.mov";
import Changelog from "./Changelog";


const videoProps = { autoPlay: true, loop: true, className: "ui", width: 300, height: 225 };

const Documentation = () =>
  <Container style={{ padding: "40px 0 100px 0" }}>
    <Grid columns={2}>
      <Grid.Column>
        <Header as="h1">Instructions</Header>
        <p>
          The Alluvial Generator visualizes how clusters change between different networks.
        </p>
        <p>
          The networks are shown as vertical stacks connected by streamlines. In each stack, nodes that are clustered
          together form a <i>module</i>, drawn as a rectangle.
        </p>
        <p>
          Streamlines connect modules that contains the same nodes. The height of the streamline is proportional to
          the aggregated flow in the nodes that are present in the connected modules.
        </p>
        <p>
          In hierarchical clusters, modules contain sub-modules. Sub-modules can be revealed by double clicking on
          the parent module. All sub-modules that have the same parent module are drawn closer together than other
          modules and sub-modules in the same network.
        </p>

        <Header>Step by step explanation</Header>
        <img src={compareSvg} alt="Comparing nodes across networks" width={500}/>

        <Header>Limitations</Header>
        <p>
          Two nodes in different networks are considered equal if their names are the same. For this to work, all nodes
          in a network <i>must have unique names</i>.
        </p>
        <p>
          If a network <i>does not have unique names</i>, you can try the option "Use node ids as identifiers",
          which uses the node ids to determine if two nodes are equal.
        </p>
        <p>
          Currently, we cannot compare state networks, except for the simple case when it is just the same network with
          different Infomap options. This feature is under development!
        </p>

        <Header>Navigation</Header>
        <p>
          Zoom in and out by scrolling. Pan the diagram by clicking and dragging. To show module information, click on
          any module.
        </p>

        <Header>Expand sub-modules</Header>
        <video {...videoProps}>
          <source src={expandModuleMov} type="video/mp4"/>
        </video>
        <p>
          To show the sub-modules within any module, double click on it.
          If the modules wiggles back and forth, the module is already expanded to its deepest level.
          We currently don't support expanding modules to it's individual nodes.
        </p>
        <p>
          To keep the heights proportional to the contained flow, we re-scale the heights of all other modules.
        </p>

        <Header>Contract sub-modules</Header>
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
        <Header as="h1">Supported formats</Header>
        <p>
          Currently, we support networks clustered by <a
          href="https://www.mapequation.org/code.html">Infomap</a> v1. Older versions might work but is not supported.
        </p>
        <p>
          The following output formats are supported:
        </p>
        <List bulleted>
          <List.Item><code>clu</code></List.Item>
          <List.Item><code>map</code></List.Item>
          <List.Item><code>tree</code></List.Item>
          <List.Item><code>ftree</code></List.Item>
        </List>
        <p>
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

        <Changelog/>
      </Grid.Column>
    </Grid>
  </Container>;

export default Documentation;
