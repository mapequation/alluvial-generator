import React from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import * as R from "ramda";

import "./App.css";
import { streamlineHorizontal } from "./streamline";


const parseOpts = {
    comments: "#",
    delimiter: " ",
    quoteChar: "\"",
    dynamicTyping: true,
    skipEmptyLines: true,
    worker: true,
};

const parseAll = (files) =>
    Promise.all(files.map(f => fetch(f)))
        .then(responses => Promise.all(responses.map(response => response.text()))
            .then(files => Promise.all(files.map(file => new Promise((complete, error) =>
                Papa.parse(file, Object.assign(parseOpts, { complete, error }))))))) // eslint-disable-line no-undef
        .catch(console.error);

const module = row => ({ id: row[0], name: row[1], flow: row[2], exitFlow: row[3] });

const node = row => ({
    path: row[0],
    name: row[1],
    flow: row[2],
    parentPath: row[0].substr(0, row[0].lastIndexOf(":")),
});

const link = row => ({ source: row[0], target: row[1], flow: row[2] });

const sectionTypes = {
    modules: module,
    nodes: node,
    links: link,
};

const parseMap = content => {
    const sections = {
        modules: [],
        nodes: [],
        links: [],
    };

    let currentSection = null;

    content.forEach(row => {
        const first = row[0];

        if (first.toString().startsWith("*")) {
            currentSection = first.substr(1).toLowerCase();
        } else if (currentSection) {
            try {
                sections[currentSection].push(sectionTypes[currentSection](row));
            } catch (err) {
                console.log(err.message);
            }
        }
    });

    return sections;
};

const calculateFlows = (map1, map2) => {
    const mappings = [];

    map1.nodes.forEach(node => {
        const { parentPath, name, flow } = node;
        const other = map2.nodes.find(match => match.name === name);
        if (other) {
            mappings.push({
                sourcePath: parentPath,
                targetPath: other.parentPath,
                flow,
            });
        }
    });

    const flows = [];

    mappings.forEach(({ sourcePath, targetPath, flow }) => {
        const found = flows.find(each => each.sourcePath === sourcePath && each.targetPath === targetPath);
        if (found) {
            found.flow += flow;
        } else {
            flows.push({ sourcePath, targetPath, flow });
        }
    });

    return flows;
};

const flow = R.prop("flow");

export default class App extends React.Component {
    static defaultProps = {
        width: 1200,
        height: 600,
        barWidth: 200,
        totalHeight: 400,
        padding: 3,
        numModules: 15,
        networks: ["/science1998_2y.map", "/science2001_2y.map", "/science2004_2y.map"],
    };

    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
        barWidth: PropTypes.number,
        totalHeight: PropTypes.number,
        padding: PropTypes.number,
        numModules: PropTypes.number,
        networks: PropTypes.arrayOf(PropTypes.string),
    };

    get totalPadding() {
        const { padding, numModules } = this.props;
        return padding * (numModules - 1);
    }

    renderDiagram(map, xOffset) {
        const { barWidth, totalHeight, padding, numModules } = this.props;

        const largestModules = R.take(numModules, map.modules);
        const moduleFlows = R.map(flow, largestModules);
        const totalFlow = R.sum(moduleFlows);

        let currentY = totalHeight;

        const modules = largestModules.map(module => {
            const height = module.flow / totalFlow * (totalHeight - this.totalPadding);
            const y = currentY - height;
            currentY = y - padding;
            return { height, y, ...module };
        });

        const bars = this.svg.append("g")
            .attr("class", "bars")
            .attr("transform", `translate(${100 + xOffset}, 100)`);

        bars.selectAll(".bar")
            .data(modules)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", barWidth)
            .attr("height", d => d.height)
            .attr("y", d => d.y)
            .attr("fill", "#fee")
            .attr("stroke", "black");
    }

    renderStreamlines(maps, xOffset) {
        const [map0, map1] = maps;
        const flows = calculateFlows(map0, map1);

        const { barWidth, totalHeight, padding, numModules } = this.props;

        const largestModules0 = R.take(numModules, map0.modules);
        const totalFlow0 = R.sum(R.map(flow, largestModules0));
        const largestModules1 = R.take(numModules, map1.modules);
        const totalFlow1 = R.sum(R.map(flow, largestModules1));

        let currentY = totalHeight;

        const moduleWithHeight = (module, totalFlow) => {
            const height = module.flow / totalFlow * (totalHeight - this.totalPadding);
            const y = currentY - height;
            currentY = y - padding;
            return { height, y, offset: 0, ...module };
        };

        const modules0 = largestModules0.map(m => moduleWithHeight(m, totalFlow0));

        currentY = totalHeight;

        const modules1 = largestModules1.map(m => moduleWithHeight(m, totalFlow1));

        const s = [];

        flows.filter(f => f.flow > 0.005)
            .sort((a, b) => b.flow - a.flow)
            .forEach(({ sourcePath, targetPath, flow }) => {
                const source = modules0.find(m => m.id.toString() === sourcePath);
                const target = modules1.find(m => m.id.toString() === targetPath);
                if (source && target) {
                    const sourceHeight = flow / source.flow * source.height;
                    const targetHeight = flow / target.flow * target.height;
                    let sourceOffset = source.y + source.height + source.offset;
                    let targetOffset = target.y + target.height + target.offset;
                    s.push([
                        [xOffset, sourceOffset], [xOffset + 200, targetOffset],
                        [xOffset + 200, targetOffset - targetHeight], [xOffset, sourceOffset - sourceHeight],
                    ]);
                    source.offset -= sourceHeight;
                    target.offset -= targetHeight;
                }
            });

        const sl = streamlineHorizontal();

        this.svg.append("g")
            .attr("transform", "translate(300, 100)")
            .selectAll(".link")
            .data(s)
            .enter()
            .append("path")
            .attr("d", sl)
            .attr("fill", "#eef")
            .attr("stroke", "black")
            .attr("opacity", 0.8);
    }

    componentDidMount() {
        const { networks } = this.props;
        this.svg = d3.select(this.node);

        parseAll(networks)
            .then(parsed => {
                const errors = R.flatten(parsed.map(p => p.errors))
                    .map(err => new Error(err));

                errors.forEach(err => {
                    throw err;
                });

                return parsed.map(each => parseMap(each.data));
            })
            .then(results => {
                results.forEach((result, i) => this.renderDiagram(result, i * 400));
                this.renderStreamlines([results[0], results[1]], 0);
                this.renderStreamlines([results[1], results[2]], 400);
            });
    }

    render() {
        const { width, height } = this.props;

        return (
            <svg style={{ background: "#efe" }} width={width} height={height} ref={node => this.node = node}/>
        );
    }
}
