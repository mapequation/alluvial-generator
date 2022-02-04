import * as d3 from "d3";
import { observer } from "mobx-react";
import { useContext, useEffect, useRef } from "react";
import { NOT_HIGHLIGHTED } from "../../alluvial";
import { StoreContext } from "../../store";

const zoom = d3.zoom().scaleExtent([0.1, 2000]);

export default observer(function SubGraph({ selectedModule, leafNodes }) {
  const ref = useRef();
  const store = useContext(StoreContext);
  const { defaultHighlightColor, highlightColors } = store;

  const network = selectedModule.parent;

  const nodesByPath = new Map(
    leafNodes.map((node) => [
      node.treePath.toString(),
      {
        path: node.treePath,
        name: node.name,
        flow: node.flow,
        id: node.stateId != null ? node.stateId : node.nodeId,
        highlightIndex: node.highlightIndex,
        parent: null,
        x: 0,
        y: 0,
      },
    ])
  );

  const nodes = [...nodesByPath.values()];

  const subModuleIds = [...network.modules.keys()].filter((id) =>
    id.startsWith(selectedModule.moduleId)
  );

  const links = [];

  const subModulesByPath = new Map();
  const subModuleLinks = [];

  const createModule = (path) => ({
    path,
    flow: 0,
    nodes: [],
    parent: null,
    isLeaf: false,
    _leafNodes: [],
    get x() {
      return (
        this.nodes.reduce((x, node) => x + node.x, 0) / (this.nodes.length || 1)
      );
    },
    get y() {
      return (
        this.nodes.reduce((y, node) => y + node.y, 0) / (this.nodes.length || 1)
      );
    },
    get r() {
      if (!this.isLeaf) return 0;
      const dx = Math.max(
        ...this.nodes.map((node) => Math.abs(this.x - node.x))
      );
      const dy = Math.max(
        ...this.nodes.map((node) => Math.abs(this.y - node.y))
      );
      return Math.sqrt(dx * dx + dy * dy);
    },
    get leafNodes() {
      if (this._leafNodes.length) return this._leafNodes;
      this._leafNodes = this.isLeaf
        ? this.nodes
        : this.nodes.reduce((nodes, node) => {
            return [...nodes, ...node.leafNodes];
          }, []);
      return this._leafNodes;
    },
  });

  for (const moduleId of subModuleIds) {
    const subModule = network.modules.get(moduleId);
    const path = subModule.path.join(":");

    for (const link of subModule.links) {
      const sourcePath = [path, link.source].join(":");
      const targetPath = [path, link.target].join(":");
      const source = nodesByPath.get(sourcePath);
      const target = nodesByPath.get(targetPath);

      if (source && target) {
        // A link between leaf-nodes
        links.push({ source, target, flow: link.flow });
      } else {
        // A link between sub-modules
        const sourcePath = [path, link.source].join(":");
        const targetPath = [path, link.target].join(":");
        const sourceModule = network.modules.get(sourcePath);
        const targetModule = network.modules.get(targetPath);

        if (sourceModule && targetModule) {
          if (!subModulesByPath.has(sourcePath)) {
            subModulesByPath.set(sourcePath, createModule(sourcePath));
          }
          if (!subModulesByPath.has(targetPath)) {
            subModulesByPath.set(targetPath, createModule(targetPath));
          }
          subModuleLinks.push({
            source: subModulesByPath.get(sourcePath),
            target: subModulesByPath.get(targetPath),
            flow: link.flow,
          });
        }
      }
    }
  }

  nodes.forEach((node) => {
    const module = subModulesByPath.get(node.path.parentPath().toString());
    if (module) {
      module.flow += node.flow;
      module.isLeaf = true;
      module.nodes.push(node);
      node.module = module;
    }
  });

  const subModules = [...subModulesByPath.values()].sort(
    (a, b) => b.path.split(":").length - a.path.split(":").length
  );

  for (const module of subModules) {
    const parentPath = module.path.substr(0, module.path.lastIndexOf(":"));
    const parent = subModulesByPath.get(parentPath);
    if (parent) {
      parent.flow += module.flow;
      parent.nodes.push(module);
      module.parent = parent;
    }
  }

  // Paint super-modules first
  subModules.reverse();

  const maxFlow = Math.max(...nodes.map((node) => node.flow));
  const maxRadius = 6;
  const nodeRadius = d3.scaleSqrt([0, maxFlow]).range([2, maxRadius]);
  const maxLinkFlow = Math.max(
    ...[...links, ...subModuleLinks].map((link) => link.flow)
  );
  const linkWidth = d3.scaleLinear().domain([0, maxLinkFlow]).range([0.05, 1]);
  const fill = (node) =>
    node.highlightIndex === NOT_HIGHLIGHTED
      ? defaultHighlightColor
      : highlightColors[node.highlightIndex];

  useEffect(() => {
    const currentRef = ref.current;

    if (currentRef == null) return;

    d3.select(currentRef)
      .call(zoom)
      .on("dblclick.zoom", null)
      .call(zoom.transform, d3.zoomIdentity);
    const zoomable = d3
      .select("#zoomable-graph")
      .attr("transform", d3.zoomIdentity);
    zoom.on("zoom", (event) => zoomable.attr("transform", event.transform));

    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(0, 0).strength(1))
      .force("collide", d3.forceCollide(maxRadius))
      .force("charge", d3.forceManyBody().strength(-50))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("link", d3.forceLink(links).distance(10).strength(1));

    const node = zoomable
      .selectAll(".node")
      .data(nodes)
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) {
              simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx += event.dx;
            d.fy += event.dy;
          })
          .on("end", (event, d) => {
            if (!event.active) {
              simulation.alphaTarget(0).restart();
            }
            d.fx = null;
            d.fy = null;
          })
      );

    const link = zoomable.selectAll(".link").data(links);

    const moduleLink = zoomable.selectAll(".module-link").data(subModuleLinks);
    const module = zoomable.selectAll(".sub-module").data(subModules);

    const circle = node.select("circle");
    const text = node.select("text");

    function drawLink(d) {
      const r1 = d.source?.r ?? nodeRadius(d.source.flow);
      const r2 = d.target?.r ?? nodeRadius(d.target.flow);
      const x1 = d.source.x || 0;
      const y1 = d.source.y || 0;
      const x2 = d.target.x || 0;
      const y2 = d.target.y || 0;
      const dx = x2 - x1 || 1e-6;
      const dy = y2 - y1 || 1e-6;
      const l = Math.sqrt(dx * dx + dy * dy);
      const x = dx / l;
      const y = dy / l;

      d3.select(this)
        .attr("x1", x1 + r1 * x)
        .attr("y1", y1 + r1 * y)
        .attr("x2", x2 - r2 * x)
        .attr("y2", y2 - r2 * y);
    }

    simulation.on("tick", () => {
      moduleLink.each(drawLink);
      module
        .select("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r);
      module.select("path").attr("d", (d) => {
        const poly = d3.polygonHull(
          d.leafNodes.map((node) => [node.x, node.y])
        );
        return "M" + poly.join("L") + "Z";
      });
      module
        .select("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("dy", (d) => d.r + 5);

      link.each(drawLink);
      circle.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      text.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });
  }, [ref, nodes, links, nodeRadius]);

  return (
    <svg
      ref={ref}
      width="100%"
      height="75%"
      viewBox="-100 -100 200 200"
      xmlns={d3.namespaces.svg}
      xmlnsXlink={d3.namespaces.xlink}
      style={{ background: "#fff" }}
    >
      <rect x={-100} y={-100} width="100%" height="100%" fill="#fff" />
      <g id="zoomable-graph">
        {subModuleLinks.map((link) => (
          <line
            key={`${link.source?.path ?? 0}-${link.target?.path ?? 0}`}
            className="module-link"
            strokeLinecap="round"
            strokeWidth={linkWidth(link.flow)}
            stroke={"var(--chakra-colors-blackAlpha-200)"}
          />
        ))}

        {subModules.map((module) => (
          <g key={module.path} className="sub-module">
            {module.isLeaf && <circle fill="hsl(0, 0%, 90%)" stroke="white" />}
            {!module.isLeaf && module.nodes.length > 2 && (
              <path fill="hsla(0, 0%, 90%, 0.3)" />
            )}
            <text
              fontSize={Math.max(nodeRadius(module.flow), 3)}
              fontWeight={600}
              textAnchor="middle"
              fill="#888"
              stroke={"var(--chakra-colors-whiteAlpha-700)"}
              strokeWidth={1}
              paintOrder="stroke"
            >
              {module.path}
            </text>
          </g>
        ))}

        {links.map((link) => (
          <line
            key={`${link.source?.id ?? 0}-${link.target?.id ?? 0}`}
            className="link"
            strokeWidth={linkWidth(link.flow)}
            stroke={"var(--chakra-colors-blackAlpha-400)"}
          />
        ))}

        {nodes.map((node) => (
          <g key={node.id} className="node">
            <circle
              fill={fill(node)}
              stroke={"var(--chakra-colors-whiteAlpha-700)"}
              strokeWidth={1}
              paintOrder="stroke"
              r={nodeRadius(node.flow)}
            />
            <text
              fontSize={Math.max(nodeRadius(node.flow), 3)}
              fontWeight={600}
              textAnchor="middle"
              dy={-(nodeRadius(node.flow) + 2)}
              fill="#888"
              stroke="var(--chakra-colors-whiteAlpha-700)"
              strokeWidth={1}
              paintOrder="stroke"
            >
              {node.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});
