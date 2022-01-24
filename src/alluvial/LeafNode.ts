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

  setParent(parent: StreamlineNode | null, side: Side) {
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

  getOpposite(side: Side): LeafNode | null {
    return this.oppositeNodes[side];
  }

  setOpposite(node: LeafNode | null, side: Side) {
    this.oppositeNodes[side] = node;
  }

  add() {
    const module =
      this.network.getModule(this.moduleId) ??
      new Module(this.network, this.moduleId, this.moduleLevel);

    const group =
      module.getGroup(this.highlightIndex, this.insignificant) ??
      new HighlightGroup(module, this.highlightIndex, this.insignificant);

    // Add the node to the matching streamline node in each branch
    // of the highlight group. The matching streamline node is determined
    // by the node's highlight index and whether it is insignificant.
    for (let branch of group) {
      const { side } = branch;
      let oppositeNode = this.getOpposite(side);
      const neighborNetwork = this.network.getNeighbor(side);

      // Does a matching node exist in the neighbor network?
      if (!oppositeNode) {
        oppositeNode = neighborNetwork?.getLeafNode(this.identifier) || null;
        this.setOpposite(oppositeNode, side);
      }

      // Get or create the streamline node this node should be attached to
      const streamlineId = StreamlineNode.createId(this, side, oppositeNode);
      let streamlineNode = this.network.getStreamlineNode(streamlineId);

      if (!streamlineNode) {
        streamlineNode = new StreamlineNode(branch, streamlineId);
        this.network.setStreamlineNode(streamlineNode.id, streamlineNode);
      }

      // If we have a matching node, we need to connect the streamline nodes
      // that this node and the opposite node are attached to.
      if (oppositeNode) {
        const oppositeSide = opposite(side);

        // Remove the node from its streamline node
        const oppositeBranch = oppositeNode.removeFromSide(oppositeSide);

        // Look up the opposite streamline node that we should connect to
        const oppositeId = streamlineNode.oppositeId;
        let oppositeStreamlineNode =
          neighborNetwork!.getStreamlineNode(oppositeId);

        // If the corresponding streamline node does not exist, create it
        // and link to it from this node's streamline node
        if (!oppositeStreamlineNode) {
          oppositeStreamlineNode = new StreamlineNode(
            oppositeBranch!,
            oppositeId
          );

          neighborNetwork!.setStreamlineNode(
            oppositeStreamlineNode.id,
            oppositeStreamlineNode
          );

          // Link the streamline nodes
          streamlineNode.linkTo(oppositeStreamlineNode);
        }

        // Add the opposite node to the (new) streamline node
        oppositeStreamlineNode.addChild(oppositeNode);
        oppositeNode.setParent(oppositeStreamlineNode, oppositeSide);
      }

      // Finally, add the node
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
    const group = this.leftParent?.getAncestor(
      HIGHLIGHT_GROUP
    ) as HighlightGroup | null;

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

              this.getOpposite(LEFT)?.setOpposite(null, RIGHT);
              this.getOpposite(RIGHT)?.setOpposite(null, LEFT);
            }
          }
        }
      }
    }
  }

  private removeFromSide(side: Side) {
    // Returns the branch (parent) of the streamline node
    // the node is attached to.

    const streamlineNode = this.getParent(side);

    if (!streamlineNode) {
      console.warn(`Node ${this.id} has no ${sideToString(side)} parent`);
      return;
    }

    // Convenience reference used in add()
    const branch = streamlineNode.parent!;

    streamlineNode.removeChild(this);
    this.setParent(null, side);

    if (streamlineNode.isEmpty) {
      // We are deleting a streamline node,
      // so opposite streamline node must be made dangling.
      const oppositeStreamlineNode = streamlineNode.opposite;

      if (oppositeStreamlineNode) {
        const neighborNetwork = this.network.getNeighbor(side)!;

        // Delete the old id
        neighborNetwork.removeStreamlineNode(oppositeStreamlineNode.id);
        oppositeStreamlineNode.makeDangling().removeLink();

        const alreadyDanglingStreamlineNode = neighborNetwork.getStreamlineNode(
          oppositeStreamlineNode.id
        );
        // Does the (new) dangling id already exist? Move nodes from it.
        if (alreadyDanglingStreamlineNode) {
          const oppositeSide = opposite(side);
          for (let node of oppositeStreamlineNode) {
            alreadyDanglingStreamlineNode.addChild(node);
            node.setParent(alreadyDanglingStreamlineNode, oppositeSide);
          }

          oppositeStreamlineNode.children.length = 0;
          oppositeStreamlineNode.parent?.removeChild(oppositeStreamlineNode);
        } else {
          // Update with the new dangling id
          neighborNetwork.setStreamlineNode(
            oppositeStreamlineNode.id,
            oppositeStreamlineNode
          );
        }
      }

      this.network.removeStreamlineNode(streamlineNode.id);
      branch.removeChild(streamlineNode);
    }

    return branch;
  }
}
