/**
 * Check that every node has a finite numeric `flow`.
 *
 * A missing, `null`, non-numeric or non-finite flow (`NaN`, `Infinity`) makes
 * the numeric sort comparators inconsistent, so the layout would depend on the
 * engine's sort algorithm and draw NaN geometry. Throws on the first bad node.
 */
export function validateNetworkNodes(nodes: unknown): void {
  if (!Array.isArray(nodes)) {
    throw new Error("The network has no nodes");
  }

  for (let i = 0; i < nodes.length; ++i) {
    const flow = nodes[i]?.flow;
    if (typeof flow !== "number" || !Number.isFinite(flow)) {
      const value =
        typeof flow === "number"
          ? String(flow)
          : flow === undefined
            ? "missing"
            : JSON.stringify(flow);
      throw new Error(`Node ${i + 1} has no finite flow (${value})`);
    }
  }
}
