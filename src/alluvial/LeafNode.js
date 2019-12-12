// @flow
import TreePath from "../lib/treepath";
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import { HIGHLIGHT_GROUP, LEAF_NODE } from "./Depth";
import HighlightGroup, { NOT_HIGHLIGHTED } from "./HighlightGroup";
import Module from "./Module";
import NetworkRoot from "./NetworkRoot";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";


export default class LeafNode extends AlluvialNodeBase {
  name: string;
  _flow: number;
  nodeId: number;
  identifier: string;
  highlightIndex: number;
  treePath: TreePath;
  depth = LEAF_NODE;
  moduleLevel: number;

  leftParent: ?StreamlineNode;
  rightParent: ?StreamlineNode;

  oppositeNodes: {
    LEFT: ?LeafNode,
    RIGHT: ?LeafNode
  } = {};

  networkRoot: NetworkRoot;

  constructor(node: Node, networkRoot: NetworkRoot) {
    super(null, networkRoot.networkId, node.path);
    this.name = node.name;
    this._flow = node.flow;
    this.identifier = node.identifier;
    this.nodeId = node.id || node.stateId || 0;
    this.treePath = new TreePath(node.path);
    this.highlightIndex =
      node.highlightIndex != null && Number.isInteger(node.highlightIndex)
        ? node.highlightIndex
        : NOT_HIGHLIGHTED;
    this.moduleLevel = node.moduleLevel && Number.isInteger(node.moduleLevel)
      ? node.moduleLevel
      : 1;
    this.networkRoot = networkRoot;
  }

  get insignificant(): boolean {
    return this.treePath.insignificant[this.moduleLevel - 1] || false;
  }

  get flow(): number {
    return this._flow;
  }

  toNode(): Node {
    return {
      path: this.id,
      flow: this.flow,
      name: this.name,
      id: this.nodeId,
      identifier: this.identifier,
      insignificant: this.insignificant,
      highlightIndex: this.highlightIndex,
      moduleLevel: this.moduleLevel
    };
  }

  get level(): number {
    return this.treePath.level;
  }

  get moduleId(): string {
    return this.treePath.ancestorAtLevelAsString(this.moduleLevel);
  }

  set parent(parent: ?StreamlineNode) {
    this.leftParent = this.rightParent = parent;
  }

  get parent(): ?StreamlineNode {
    return this.leftParent || this.rightParent;
  }

  getParent(side: Side): ?StreamlineNode {
    return side === LEFT ? this.leftParent : this.rightParent;
  }

  setParent(parent: StreamlineNode, side: Side) {
    if (side === LEFT) {
      this.leftParent = parent;
    } else {
      this.rightParent = parent;
    }
  }

  add() {
    const module = this.networkRoot.getModule(this.moduleId) ||
      new Module(this.networkRoot, this.moduleId, this.moduleLevel);
    const group = module.getGroup(this.highlightIndex, this.insignificant) ||
      new HighlightGroup(module, this.highlightIndex, this.insignificant);

    for (let branch of group) {
      let oppositeNode = this.oppositeNodes[branch.side];

      if (!oppositeNode) {
        const neighborNetwork = this.networkRoot.getNeighbor(branch.side);
        oppositeNode = neighborNetwork ? neighborNetwork.getLeafNode(this.identifier) : null;
        this.oppositeNodes[branch.side] = oppositeNode;
      }

      const streamlineId = StreamlineId.create(this, branch.side, oppositeNode);
      let streamlineNode = StreamlineId.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(branch, streamlineId);
        StreamlineId.set(streamlineId, streamlineNode);
      }

      if (streamlineNode.hasTarget) {
        const oppositeSide = opposite(branch.side);
        if (oppositeNode) {
          oppositeNode.removeFromSide(oppositeSide);
          oppositeNode.addToSide(oppositeSide, this);
        }
      }

      streamlineNode.addChild(this);
      this.setParent(streamlineNode, branch.side);
    }
  }

  addToSide(side: Side, oppositeNode: ?LeafNode) {
    const streamlineId = StreamlineId.create(this, side, oppositeNode);
    let streamlineNode = StreamlineId.get(streamlineId);

    if (!streamlineNode) {
      const oldStreamlineNode = this.getParent(side);
      if (!oldStreamlineNode) {
        console.warn(`Node ${this.id} has no ${sideToString(side)} parent`);
        return;
      }
      const branch = oldStreamlineNode.parent;
      if (!branch) {
        console.warn(`Streamline node with id ${oldStreamlineNode.id} has no parent`);
        return;
      }

      streamlineNode = new StreamlineNode(branch, streamlineId);
      StreamlineId.set(streamlineId, streamlineNode);

      if (oppositeNode) {
        const oppositeId = StreamlineId.oppositeId(streamlineId);
        const oppositeStreamlineNode = StreamlineId.get(oppositeId);

        if (oppositeStreamlineNode) {
          streamlineNode.linkTo(oppositeStreamlineNode);
        }
      }
    }

    streamlineNode.addChild(this);
    this.setParent(streamlineNode, side);
  }

  removeFromParent() {
    if (this.leftParent) this.leftParent.removeChild(this);
    if (this.rightParent) this.rightParent.removeChild(this);
  }

  remove(removeNetworkRoot: boolean = false) {
    const group = this.getAncestor(HIGHLIGHT_GROUP);

    this.removeFromSide(LEFT);
    this.removeFromSide(RIGHT);

    // No need to remove branches here
    if (!group) {
      console.warn(`Node ${this.id} was removed without belonging to a group.`);
      return;
    }

    if (group.isEmpty) {
      group.removeFromParent();
    }

    const module = group.parent;
    if (!module) {
      console.warn(`Node ${this.id} was removed without belonging to a module.`);
      return;
    }

    if (module.isEmpty) {
      module.removeFromParent();
    }

    const networkRoot = module.parent;
    if (!networkRoot) {
      console.warn(`Node ${this.id} was removed without belonging to a network root.`);
      return;
    }

    if (removeNetworkRoot && networkRoot.isEmpty) {
      networkRoot.removeFromParent();

      [LEFT, RIGHT].forEach(side => {
        if (this.oppositeNodes[side]) {
          // Delete this node from opposite
          this.oppositeNodes[side].opposideNodes[opposite(side)] = null;
        }
      });
    }
  }

  removeFromSide(side: Side) {
    const streamlineNode = this.getParent(side);

    if (!streamlineNode) {
      console.warn(`Node ${this.id} has no ${sideToString(side)} parent`);
      return;
    }

    // Do not remove node parent, it is used in addToSide later
    streamlineNode.removeChild(this);

    if (streamlineNode.isEmpty) {
      // We are deleting streamlineNode,
      // so opposite streamline node must be made dangling.
      const oppositeStreamlineNode = streamlineNode.getOpposite();
      if (oppositeStreamlineNode) {
        // Delete the old id
        StreamlineId.delete(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling();
        oppositeStreamlineNode.removeLink();

        const alreadyDanglingStreamlineNode = StreamlineId.get(oppositeStreamlineNode.id);
        // Does the (new) dangling id already exist? Move nodes from it.
        if (alreadyDanglingStreamlineNode) {
          for (let node of oppositeStreamlineNode) {
            alreadyDanglingStreamlineNode.addChild(node);
            node.setParent(alreadyDanglingStreamlineNode, opposite(side));
          }

          oppositeStreamlineNode.removeFromParent();
        } else {
          // Update with the new dangling id
          StreamlineId.set(oppositeStreamlineNode.id, oppositeStreamlineNode);
        }
      }

      StreamlineId.delete(streamlineNode.id);
      streamlineNode.removeFromParent();
    }
  }

  update() {
    this.remove();
    this.add();
  }

  asObject(): Object {
    return {
      ...super.asObject(),
      name: this.name,
      highlightIndex: this.highlightIndex
    };
  }

  * leafNodes(): Iterable<AlluvialNode> {
    yield this;
  }
}
