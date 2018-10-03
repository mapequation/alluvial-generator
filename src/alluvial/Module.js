// @flow
import Branch from "./Branch";
import NodeBase from "./NodeBase";


export default class Module extends NodeBase {
    left = new Branch();
    right = new Branch();
}
