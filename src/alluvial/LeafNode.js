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
import StreamlineNode from "./StreamlineNode";


const streamlineNodesById: Map<string, StreamlineNode> = new Map();

export default class LeafNode extends AlluvialNodeBase {
  name: string;
  flow: number;
  nodeId: number;
  identifier: string;
  highlightIndex: number;
  treePath: TreePath;
  depth = LEAF_NODE;
  moduleLevel: number;

  leftIndex: number = -1;
  rightIndex: number = -1;

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
    this.flow = node.flow;
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

  getIndex(side: Side): number {
    return side === LEFT ? this.leftIndex : this.rightIndex;
  }

  setIndex(index: number, side: Side) {
    if (side === LEFT) {
      this.leftIndex = index;
    } else {
      this.rightIndex = index;
    }
  }

  add() {
    const module = this.networkRoot.getModule(this.moduleId) ||
      new Module(this.networkRoot, this.moduleId, this.moduleLevel);
    const group = module.getGroup(this.highlightIndex, this.insignificant) ||
      new HighlightGroup(module, this.highlightIndex, this.insignificant);

    for (let branch of group) {
      const { side } = branch;
      let oppositeNode = this.oppositeNodes[side];

      if (!oppositeNode) {
        const neighborNetwork = this.networkRoot.getNeighbor(side);
        if (neighborNetwork) {
          oppositeNode = this.oppositeNodes[side] = neighborNetwork.getLeafNode(this.identifier);
        }
      }

      const streamlineId = StreamlineNode.createId(this, side, oppositeNode);
      let streamlineNode = streamlineNodesById.get(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(branch, streamlineId);
        streamlineNodesById.set(streamlineNode.id, streamlineNode);
      }

      if (oppositeNode) {
        const oppositeSide = opposite(side);
        oppositeNode.removeFromSide(oppositeSide);
        const oppositeId = streamlineNode.oppositeId;
        let oppositeStreamlineNode = streamlineNodesById.get(oppositeId);

        if (!oppositeStreamlineNode) {
          const oldStreamlineNode = oppositeNode.getParent(oppositeSide);
          if (!oldStreamlineNode || !oldStreamlineNode.parent) {
            return;
          }

          const branch = oldStreamlineNode.parent;
          oppositeStreamlineNode = new StreamlineNode(branch, oppositeId);
          streamlineNodesById.set(oppositeStreamlineNode.id, oppositeStreamlineNode);
          streamlineNode.linkTo(oppositeStreamlineNode);
        }

        oppositeStreamlineNode.addChild(oppositeNode);
        oppositeNode.setParent(oppositeStreamlineNode, oppositeSide);
      }

      streamlineNode.addChild(this);
      this.setParent(streamlineNode, side);
    }
  }

  remove(removeNetworkRoot: boolean = false) {
    const group = this.getAncestor(HIGHLIGHT_GROUP);

    this.removeFromSide(LEFT);
    this.removeFromSide(RIGHT);

    if (group) {
      const module = group.parent;
      if (module) {
        if (group.isEmpty) {
          module.removeChild(group);
        }

        const networkRoot = module.parent;
        if (networkRoot) {
          if (module.isEmpty) {
            networkRoot.removeChild(module);
          }

          const alluvialRoot = networkRoot.parent;
          if (alluvialRoot) {
            if (removeNetworkRoot && networkRoot.isEmpty) {
              alluvialRoot.removeChild(networkRoot);

              if (this.oppositeNodes[LEFT]) {
                this.oppositeNodes[LEFT].oppositeNodes[RIGHT] = null;
              }
              if (this.oppositeNodes[RIGHT]) {
                this.oppositeNodes[RIGHT].oppositeNodes[LEFT] = null;
              }
            }
          }
        }
      }
    }
  }

  removeFromSide(side: Side) {
    const streamlineNode = this.getParent(side);

    if (!streamlineNode) {
      console.warn(`Node ${this.id} has no ${sideToString(side)} parent`);
      return;
    }

    // Do not remove node parent, it is used in add later
    streamlineNode.removeChild(this);

    if (streamlineNode.isEmpty) {
      // We are deleting streamlineNode,
      // so opposite streamline node must be made dangling.
      const oppositeStreamlineNode = streamlineNode.getOpposite();

      if (oppositeStreamlineNode) {
        // Delete the old id
        streamlineNodesById.delete(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling();
        oppositeStreamlineNode.removeLink();

        const alreadyDanglingStreamlineNode = streamlineNodesById.get(oppositeStreamlineNode.id);
        // Does the (new) dangling id already exist? Move nodes from it.
        if (alreadyDanglingStreamlineNode) {
          const oppositeSide = opposite(side);
          for (let node of oppositeStreamlineNode) {
            alreadyDanglingStreamlineNode.addChild(node);
            node.setParent(alreadyDanglingStreamlineNode, oppositeSide);
          }

          const branch = oppositeStreamlineNode.parent;
          if (branch) {
            branch.removeChild(oppositeStreamlineNode);
          }
        } else {
          // Update with the new dangling id
          streamlineNodesById.set(oppositeStreamlineNode.id, oppositeStreamlineNode);
        }
      }

      streamlineNodesById.delete(streamlineNode.id);
      const branch = streamlineNode.parent;
      if (branch) {
        branch.removeChild(streamlineNode);
      }
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
