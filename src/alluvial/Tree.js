class TreeNode {
  path: number;
  size: number = 0;
  nodes: Array<any> = [];

  constructor(path: number = 0) {
    this.path = path;
  }
}


type Child = {
  path: number[];
}

export default class Tree {
  root = new TreeNode();

  constructor(children: Child[], getSize: (Child => number)) {
    children.forEach(child => {
      let parent = this.root;

      for (let path of child.path) {
        let node = parent.nodes.find(node => node.path === path);

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

  sort(tree = this.root): Tree {
    tree.nodes.sort((a, b) => b.size - a.size);
    tree.nodes.forEach(node => {
      if (node.nodes) this.sort(node);
    });

    return this;
  }

  flatten(tree = this.root): Child[] {
    return tree.nodes.reduce((flattened, toFlatten) =>
        flattened.concat(Array.isArray(toFlatten.nodes) ? this.flatten(toFlatten) : toFlatten),
      [])
  }
}
