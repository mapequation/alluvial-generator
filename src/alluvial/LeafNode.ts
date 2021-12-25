import TreePath from "../utils/TreePath";
import AlluvialNodeBase from "./AlluvialNode";
import { HIGHLIGHT_GROUP, LEAF_NODE } from "./Depth";
import HighlightGroup, { NOT_HIGHLIGHTED } from "./HighlightGroup";
import Module from "./Module";
import Network from "./Network";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import StreamlineNode from "./StreamlineNode";

export default class LeafNode extends AlluvialNodeBase<never> {
  readonly depth = LEAF_NODE;
  readonly name: string;
  readonly flow: number;
  readonly nodeId: number;
  readonly stateId: number | null = null;
  readonly identifier: string;
  readonly treePath: TreePath;
  highlightIndex: number;
  moduleLevel: number;

  private leftIndex: number = -1;
  private rightIndex: number = -1;

  private leftParent: StreamlineNode | null = null;
  private rightParent: StreamlineNode | null = null;

  private oppositeNodes: {
    [side: number]: LeafNode | null;
  } = {
    [LEFT]: null,
    [RIGHT]: null,
  };

  private readonly network: Network;

  constructor(node: any, network: Network) {
    // FIXME remove any
    super(null, network.networkId, node.path);
    this.name = node.name;
    this.flow = node.flow;
    this.nodeId = node.id;
    this.stateId = node.stateId != null ? node.stateId : null;
    this.identifier = node.identifier;
    this.treePath = new TreePath(node.path);
    this.highlightIndex =
      node.highlightIndex && Number.isInteger(node.highlightIndex)
        ? node.highlightIndex
        : NOT_HIGHLIGHTED;
    this.moduleLevel =
      node.moduleLevel && Number.isInteger(node.moduleLevel)
        ? node.moduleLevel
        : 1;
    this.network = network;
  }

  get insignificant(): boolean {
    return !this.treePath.isSignificant(this.moduleLevel - 1);
  }

  get level(): number {
    return this.treePath.level;
  }

  get moduleId(): string {
    return this.treePath.ancestorAtLevelAsString(this.moduleLevel);
  }

  get childFlow() {
    return this.flow;
  }

  getParent(side: Side) {
    return side === LEFT ? this.leftParent : this.rightParent;
  }

  setParent(parent: StreamlineNode, side: Side) {
    if (side === LEFT) {
      this.leftParent = parent;
    } else {
      this.rightParent = parent;
    }
  }

  getIndex(side: Side) {
    // index in the parent's children array
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
    const root = this.network.parent;
    const module =
      this.network.getModule(this.moduleId) ??
      new Module(this.network, this.moduleId, this.moduleLevel);
    const group =
      module.getGroup(this.highlightIndex, this.insignificant) ??
      new HighlightGroup(module, this.highlightIndex, this.insignificant);

    for (let branch of group) {
      const { side } = branch;
      let oppositeNode = this.oppositeNodes[side];

      if (!oppositeNode) {
        oppositeNode = this.oppositeNodes[side] =
          this.network.getNeighbor(side)?.getLeafNode(this.identifier) ?? null;
      }

      const streamlineId = StreamlineNode.createId(this, side, oppositeNode);
      let streamlineNode = root.getStreamlineNode(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(branch, streamlineId);
        root.setStreamlineNode(streamlineNode.id, streamlineNode);
      }

      if (oppositeNode) {
        const oppositeSide = opposite(side);
        oppositeNode.removeFromSide(oppositeSide);
        const oppositeId = streamlineNode.oppositeId;
        let oppositeStreamlineNode = root.getStreamlineNode(oppositeId);

        if (!oppositeStreamlineNode) {
          const oldStreamlineNode = oppositeNode.getParent(oppositeSide);
          if (!oldStreamlineNode || !oldStreamlineNode.parent) {
            return;
          }

          oppositeStreamlineNode = new StreamlineNode(
            oldStreamlineNode.parent,
            oppositeId
          );
          root.setStreamlineNode(
            oppositeStreamlineNode.id,
            oppositeStreamlineNode
          );
          streamlineNode.linkTo(oppositeStreamlineNode);
        }

        oppositeStreamlineNode.addChild(oppositeNode);
        oppositeNode.setParent(oppositeStreamlineNode, oppositeSide);
      }

      streamlineNode.addChild(this);
      this.setParent(streamlineNode, side);
    }
  }

  update() {
    this.remove();
    this.add();
  }

  *leafNodes() {
    yield this;
  }

  private remove(removeNetwork: boolean = false) {
    const group = this.getAncestor(HIGHLIGHT_GROUP) as HighlightGroup | null;

    this.removeFromSide(LEFT);
    this.removeFromSide(RIGHT);

    if (group) {
      const module = group.parent;
      if (module) {
        if (group.isEmpty) {
          module.removeChild(group);
        }

        const network = module.parent;
        if (network) {
          if (module.isEmpty) {
            network.removeChild(module);
          }

          const root = network.parent;
          if (root) {
            if (removeNetwork && network.isEmpty) {
              root.removeChild(network);

              if (this.oppositeNodes[LEFT]) {
                // @ts-ignore
                this.oppositeNodes[LEFT].oppositeNodes[RIGHT] = null;
              }
              if (this.oppositeNodes[RIGHT]) {
                // @ts-ignore
                this.oppositeNodes[RIGHT].oppositeNodes[LEFT] = null;
              }
            }
          }
        }
      }
    }
  }

  private removeFromSide(side: Side) {
    const root = this.network.parent;
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
      const oppositeStreamlineNode = streamlineNode.opposite;

      if (oppositeStreamlineNode) {
        // Delete the old id
        root.removeStreamlineNode(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling().removeLink();

        const alreadyDanglingStreamlineNode = root.getStreamlineNode(
          oppositeStreamlineNode.id
        );
        // Does the (new) dangling id already exist? Move nodes from it.
        if (alreadyDanglingStreamlineNode) {
          const oppositeSide = opposite(side);
          for (let node of oppositeStreamlineNode) {
            alreadyDanglingStreamlineNode.addChild(node);
            node.setParent(alreadyDanglingStreamlineNode, oppositeSide);
          }

          oppositeStreamlineNode.parent?.removeChild(oppositeStreamlineNode);
        } else {
          // Update with the new dangling id
          root.setStreamlineNode(
            oppositeStreamlineNode.id,
            oppositeStreamlineNode
          );
        }
      }

      root.removeStreamlineNode(streamlineNode.id);
      streamlineNode.parent.removeChild(streamlineNode);
    }
  }
}
