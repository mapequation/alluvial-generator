// @flow
import TreePath from "../lib/treepath";
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import { HIGHLIGHT_GROUP, LEAF_NODE } from "./Depth";
import { NOT_HIGHLIGHTED } from "./HighlightGroup";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import StreamlineId from "./StreamlineId";
import StreamlineNode from "./StreamlineNode";


export default class LeafNode extends AlluvialNodeBase {
  name: string;
  nodeId: number;
  identifier: string;
  insignificant: boolean;
  highlightIndex: number;
  treePath: TreePath;
  depth = LEAF_NODE;
  moduleLevel: number;

  leftParent: ?StreamlineNode;
  rightParent: ?StreamlineNode;

  constructor(node: Node, networkId: string) {
    super(null, networkId, node.path);
    this.name = node.name;
    this.flow = node.flow;
    this.identifier = node.identifier;
    this.nodeId = node.id || node.stateId || 0;
    this.treePath = new TreePath(node.path);
    this.insignificant = node.insignificant || false;
    this.highlightIndex =
      node.highlightIndex != null && Number.isInteger(node.highlightIndex)
        ? node.highlightIndex
        : NOT_HIGHLIGHTED;
    this.moduleLevel = node.moduleLevel && Number.isInteger(node.moduleLevel)
      ? node.moduleLevel
      : 1;
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

  removeFromParent() {
    if (this.leftParent) this.leftParent.removeChild(this);
    if (this.rightParent) this.rightParent.removeChild(this);
  }

  remove(removeNetworkRoot: boolean = true) {
    const group = this.getAncestor(HIGHLIGHT_GROUP);

    this.removeFromSide(LEFT);
    this.removeFromSide(RIGHT);

    // No need to remove branches here
    if (!group) {
      console.warn(`Node ${this.id} was removed without belonging to a group.`);
      return;
    }
    group.flow -= this.flow;
    if (group.isEmpty) {
      group.removeFromParent();
    }

    const module = group.parent;
    if (!module) {
      console.warn(`Node ${this.id} was removed without belonging to a module.`);
      return;
    }
    module.flow -= this.flow;
    if (module.isEmpty) {
      module.removeFromParent();
    }

    const networkRoot = module.parent;
    if (!networkRoot) {
      console.warn(`Node ${this.id} was removed without belonging to a network root.`);
      return;
    }
    networkRoot.flow -= this.flow;
    if (removeNetworkRoot && networkRoot.isEmpty) {
      networkRoot.removeFromParent();
    }

    const alluvialRoot = networkRoot.parent;
    if (!alluvialRoot) return;
    alluvialRoot.flow -= this.flow;
  }

  removeFromSide(side: Side) {
    const streamlineNode = this.getParent(side);

    if (!streamlineNode) {
      console.warn(`Node ${this.id} has no ${sideToString(side)} parent`);
      return;
    }

    // Do not remove node parent, it is used in addToSide later
    streamlineNode.removeChild(this);
    streamlineNode.flow -= this.flow;

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
        // Note: as we move nodes around we don't need to propagate flow.
        if (alreadyDanglingStreamlineNode) {
          for (let node of oppositeStreamlineNode) {
            alreadyDanglingStreamlineNode.addChild(node);
            alreadyDanglingStreamlineNode.flow += node.flow;
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

    const branch = streamlineNode.parent;
    if (!branch) {
      console.warn(`Streamline node with id ${streamlineNode.id} has no parent`);
      return;
    }
    branch.flow -= this.flow;
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
