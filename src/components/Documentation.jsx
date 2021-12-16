import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import compareSvg from "../images/compare.svg";
import expandModuleMov from "../images/expand.mov";
import regroupModuleMov from "../images/regroup.mov";

const videoProps = {
  autoPlay: true,
  loop: true,
  className: "ui",
  width: 300,
  height: 225,
};

const Documentation = ({ onClose }) => (
  <>
    <DialogTitle>About</DialogTitle>
    <DialogContent>
      <p>
        The Alluvial Generator visualizes how clusters change between different
        networks in an{" "}
        <a href="//en.wikipedia.org/wiki/Alluvial_diagram">alluvial diagram</a>.
      </p>
      <p>
        The networks are shown as vertical stacks connected by streamlines. In
        each stack, nodes that are clustered together form a <i>module</i>,
        drawn as a rectangle.
      </p>
      <p>
        Streamlines connect modules that contains the same nodes. The height of
        the streamline is proportional to the aggregated flow in the nodes that
        are present in the connected modules.
      </p>
      <p>
        In hierarchical clusters, modules contain sub-modules. Sub-modules can
        be revealed by double clicking on the parent module. All sub-modules
        that have the same parent module are drawn closer together than other
        modules and sub-modules in the same network.
      </p>

      <h2>Step by step explanation</h2>
      <img src={compareSvg} alt="Comparing nodes across networks" width={500} />

      <h2>Navigation</h2>
      <p>
        Zoom in and out by scrolling. Pan the diagram by clicking and dragging.
        To show module information, click on any module.
      </p>

      <h3>Expand sub-modules</h3>
      <video {...videoProps}>
        <source src={expandModuleMov} type="video/mp4" />
      </video>
      <p>
        To show the sub-modules within any module, double click on it. If the
        modules wiggles back and forth, the module is already expanded to its
        deepest level. We currently don't support expanding modules to it's
        individual nodes.
      </p>
      <p>
        To keep the heights proportional to the contained flow, we re-scale the
        heights of all other modules.
      </p>

      <h3>Contract sub-modules</h3>
      <video {...videoProps}>
        <source src={regroupModuleMov} type="video/mp4" />
      </video>
      <p>
        To regroup sub-modules into their parent module, double click on any
        sub-module while holding the <kbd>shift</kbd> key.
      </p>
      <p>
        All modules with the same parent will be re-grouped into the parent
        module.
      </p>

      <h2>Supported formats</h2>
      <p>
        We support networks clustered by{" "}
        <a href="https://www.mapequation.org/infomap">Infomap</a> v1 or later.
      </p>
      <p>The following output formats are supported:</p>
      <ul>
        <li>
          <code>clu</code>
        </li>
        <li>
          <code>tree</code>
        </li>
        <li>
          <code>ftree</code>
        </li>
        <li>
          <code>json</code>
        </li>
      </ul>
      <p>
        To get hierarchically nested modules, you need to use the formats{" "}
        <code>tree</code>, <code>ftree</code> or <code>json</code>
      </p>
      <p>
        Infomap is available on the web at{" "}
        <a href="https://www.mapequation.org/infomap">Infomap Online</a>.
      </p>
      <p>
        Read more about Infomap output formats on the{" "}
        <a href="https://www.mapequation.org/infomap/#Output">
          Infomap documentation page
        </a>
        .
      </p>

      <h2>References</h2>
      <p>
        If you are using the software at mapequation.org in one of your research
        articles or otherwise want to refer to it, please cite{" "}
        <a href="https://www.mapequation.org/publications.html">
          relevant publication
        </a>{" "}
        or use the following format:
      </p>
      <p>
        D. Edler, A. Eriksson and M. Rosvall, The MapEquation software package,
        available online at{" "}
        <a href="https://www.mapequation.org">mapequation.org</a>.
      </p>
    </DialogContent>
    <DialogActions>
      <Button
        href="https://github.com/mapequation/alluvial-generator/issues"
        variant="outlined"
        sx={{ marginRight: "auto" }}
        startIcon={<GitHubIcon />}
      >
        Feedback
      </Button>
      <Button variant="contained" onClick={onClose}>
        Close
      </Button>
    </DialogActions>
  </>
);

export default Documentation;
