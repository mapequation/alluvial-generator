class TreeNode {
  path;
  size = 0;
  nodes = [];

  constructor(path = 0) {
    this.path = path;
  }
}

export default class Tree {
  root = new TreeNode();

  constructor(children, getSize) {
    children.forEach((child) => {
      let parent = this.root;

      for (let path of child.path) {
        let node = parent.nodes.find((node) => node.path === path);

        if (!node) {
          node = new TreeNode(path);
          parent.nodes.push(node);
        }

        node.size += getSize(child);
        parent = node;
      }

      parent.nodes.push(child);
    });
  }

  sort(tree = this.root) {
    tree.nodes.sort((a, b) => b.size - a.size);
    tree.nodes.forEach((node) => {
      if (node.nodes) this.sort(node);
    });

    return this;
  }

  flatten(tree = this.root) {
    return tree.nodes.reduce(
      (flattened, toFlatten) =>
        flattened.concat(
          Array.isArray(toFlatten.nodes) ? this.flatten(toFlatten) : toFlatten
        ),
      []
    );
  }
}
