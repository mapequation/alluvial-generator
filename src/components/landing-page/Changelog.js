import React from "react";
import ReactMarkdown from "react-markdown";
import { Header as SemanticHeader, List as SemanticList } from "semantic-ui-react";
import CHANGELOG_md from "../../CHANGELOG.md";


const Header = ({ level, ...props }) => <SemanticHeader as={`h${level}`} {...props} />;

const List = ({ tight, ...props }) => <SemanticList {...props} />;
const ListItem = ({ tight, ordered, ...props }) => <SemanticList.Item {...props} />;

export default class Changelog extends React.Component {
  state = {
    md: ""
  };

  componentDidMount() {
    fetch(CHANGELOG_md)
      .then(res => res.text())
      .then(md => this.setState({ md }))
      .catch(err => console.log(err));
  }

  render() {
    return <ReactMarkdown
      source={this.state.md}
      renderers={{
        paragraph: () => null,
        heading: Header,
        list: List,
        listItem: ListItem
      }}
    />;
  }
}
