import React from "react";

import "./App.css";
import { parseMap } from "./parse-map";
import AlluvialDiagram from "./AlluvialDiagram";


export default class App extends React.Component {
    state = {
        networks: null,
    };

    componentDidMount() {
        const networks = ["/science1998_2y.map", "/science2001_2y.map", "/science2004_2y.map"];

        const parseOpts = {
            comments: "#",
            delimiter: " ",
            quoteChar: "\"",
            dynamicTyping: true,
            skipEmptyLines: true,
            worker: true,
        };

        Promise.all(networks.map(f => fetch(f)))
            .then(responses =>
                Promise.all(responses.map(res => res.text()))
                    .then(files =>
                        Promise.all(files.map(file => new Promise((complete, error) =>
                            Papa.parse(file, Object.assign(parseOpts, { complete, error }))))))) // eslint-disable-line no-undef
            .then(parsed => {
                parsed.map(_ => _.errors).forEach(_ => _.forEach(err => {
                    throw err;
                }));
                return parsed.map(each => parseMap(each.data));
            })
            .then(networks => this.setState({ networks }))
            .catch(console.error);
    }

    render() {
        const { networks } = this.state;

        if (networks) {
            return <AlluvialDiagram networks={networks}/>;
        } else {
            return <div>Loading...</div>;
        }
    }
}
