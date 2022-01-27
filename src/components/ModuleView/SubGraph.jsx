import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { StoreContext } from "../../store";
import { NOT_HIGHLIGHTED } from "../../alluvial/HighlightGroup";

const zoom = d3.zoom().scaleExtent([0.1, 1000]);

export default observer(function SubGraph({ module }) {
  const ref = useRef();
  const store = useContext(StoreContext);
  const { defaultHighlightColor, highlightColors } = store;

  const network = module.parent;
  const leafNodes = module.getLeafNodes();

  const nodesById = new Map(
    leafNodes.map((node) => [
      node.treePath.rank,
      {
        path: node.treePath,
        name: node.name,
        flow: node.flow,
        id: node.stateId != null ? node.stateId : node.nodeId,
        highlightIndex: node.highlightIndex,
      },
    ])
  );

  const moduleLinks = network.moduleLinks.get(module.moduleId);

  const subModules = [...network.moduleLinks.keys()].filter((moduleId) =>
    moduleId.startsWith(module.moduleId)
  );

  console.log(moduleLinks);
  console.log(subModules);

  const links = moduleLinks.links
    .map((link) => {
      const source = nodesById.get(link.source);
      const target = nodesById.get(link.target);

      if (!source || !target) return null;

      return { source, target, flow: link.flow };
    })
    .filter((link) => link != null);

  const nodes = [...nodesById.values()];

  const maxFlow = Math.max(...nodes.map((node) => node.flow));
  const nodeRadius = d3.scaleSqrt([0, maxFlow]).range([2, 6]);
  const maxLinkFlow = Math.max(...links.map((link) => link.flow));
  const linkWidth = d3.scaleLinear().domain([0, maxLinkFlow]).range([0.05, 1]);

  const radius = 5;

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
      .force("center", d3.forceCenter(0, 0))
      .force("collide", d3.forceCollide(2 * radius))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("link", d3.forceLink(links).distance(10));

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

    node.on("click", function () {
      node.selectAll("circle").attr("stroke", "#888");
      d3.select(this).select("circle").attr("stroke", "#f00");
    });

    d3.select(currentRef)
      .select("rect")
      .on("click", function () {
        node.selectAll("circle").attr("stroke", "#888");
      });

    const link = zoomable.selectAll(".link").data(links);

    function drawLink(d) {
      const r1 = nodeRadius(d.source.flow);
      const r2 = nodeRadius(d.target.flow);
      const x1 = d.source.x || 0;
      const y1 = d.source.y || 0;
      const x2 = d.target.x || 0;
      const y2 = d.target.y || 0;
      const dx = x2 - x1 || 1e-6;
      const dy = y2 - y1 || 1e-6;
      const l = Math.sqrt(dx * dx + dy * dy);
      const dir = { x: dx / l, y: dy / l };

      d3.select(this)
        .attr("x1", x1 + r1 * dir.x)
        .attr("y1", y1 + r1 * dir.y)
        .attr("x2", x2 - r2 * dir.x)
        .attr("y2", y2 - r2 * dir.y);
    }

    simulation.on("tick", () => {
      link.each(drawLink);

      node
        .select("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

      node
        .select("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y);
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
      <rect width="100%" height="100%" fill="#fff" />
      <g id="zoomable-graph">
        {links.map((link) => (
          <line
            key={`${link.source?.id ?? 0}-${link.target?.id ?? 0}`}
            className="link"
            x1={link.source?.x ?? 0}
            y1={link.source?.y ?? 0}
            x2={link.target?.x ?? 0}
            y2={link.target?.y ?? 0}
            style={{
              stroke: "var(--chakra-colors-blackAlpha-400)",
            }}
            strokeWidth={linkWidth(link.flow)}
            //markerEnd="url(#arrow_black)"
          />
        ))}

        {nodes.map((node) => (
          <g key={node.id} className="node">
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius(node.flow)}
              fill={
                node.highlightIndex === NOT_HIGHLIGHTED
                  ? defaultHighlightColor
                  : highlightColors[node.highlightIndex]
              }
              strokeWidth={1}
              paintOrder="stroke"
              style={{
                stroke: "var(--chakra-colors-whiteAlpha-700)",
              }}
            />
            <text
              x={node.x}
              y={node.y}
              dy={-(nodeRadius(node.flow) + 2)}
              textAnchor="middle"
              style={{
                stroke: "var(--chakra-colors-whiteAlpha-700)",
              }}
              strokeWidth={1}
              paintOrder="stroke"
              fontWeight={600}
              fill="#888"
              fontSize={Math.max(nodeRadius(node.flow), 3)}
            >
              {node.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});
