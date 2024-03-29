import TreePath from "../utils/TreePath";
import AlluvialNodeBase from "./AlluvialNode";
import { HIGHLIGHT_GROUP, LEAF_NODE } from "./Depth";
import HighlightGroup, { NOT_HIGHLIGHTED } from "./HighlightGroup";
import Module from "./Module";
import Network from "./Network";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import StreamlineNode from "./StreamlineNode";

export type Identifier = "id" | "name"; // FIXME

export default class LeafNode extends AlluvialNodeBase<never> {
  readonly depth = LEAF_NODE;
  readonly name: string;
  private flow_: number;
  readonly nodeId: number;
  readonly stateId?: number | null = null;
  readonly layerId?: number | null = null;
  readonly metadata?: { [key: string]: string | number };
  readonly identifier: string;
  readonly treePath: TreePath;
  highlightIndex: number;
  moduleLevel: number;
  visible = true;

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

  // FIXME use Infomap types
  constructor(node: any, network: Network) {
    super(null, network.networkId, node.path);
    this.name = node.name;
    this.flow_ = node.flow;
    this.nodeId = node.id;
    this.stateId = node.stateId != null ? node.stateId : null;
    this.layerId = node.layerId != null ? node.layerId : null;
    this.metadata = node.metadata != null ? node.metadata : null;
    this.identifier = node.identifier;
    this.treePath = new TreePath(node.path);
    this.highlightIndex =
      node.highlightIndex != null && Number.isInteger(node.highlightIndex)
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

  // @ts-ignore
  get flow() {
    return this.visible ? this.flow_ : 0;
  }

  set flow(flow: number) {
    this.flow_ = flow;
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
        this.network.setStreamlineNode(
          streamlineNode.currentId,
          streamlineNode
        );
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
            oppositeStreamlineNode.currentId,
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

    const module = group?.parent;
    const network = module?.parent;
    const root = network?.parent;

    if (group?.isEmpty) {
      module?.removeChild(group);
    }

    if (module?.isEmpty) {
      network?.removeChild(module);
    }

    if (removeNetwork && network?.isEmpty) {
      root?.removeChild(network);

      this.getOpposite(LEFT)?.setOpposite(null, RIGHT);
      this.getOpposite(RIGHT)?.setOpposite(null, LEFT);
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
        neighborNetwork.removeStreamlineNode(oppositeStreamlineNode.currentId);
        oppositeStreamlineNode.makeDangling().removeLink();

        const alreadyDanglingStreamlineNode = neighborNetwork.getStreamlineNode(
          oppositeStreamlineNode.currentId
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
            oppositeStreamlineNode.currentId,
            oppositeStreamlineNode
          );
        }
      }

      this.network.removeStreamlineNode(streamlineNode.currentId);
      branch.removeChild(streamlineNode);
    }

    return branch;
  }
}
