import { describe, expect, it } from "vitest";
import TreePath from "./TreePath";

function parse(path: string | number[]) {
  const treePath = new TreePath(path);
  return {
    path: treePath.toString(),
    level: treePath.level,
    significant: [0, 1, 2].map((level) => treePath.isSignificant(level)),
  };
}

describe("TreePath constructor", () => {
  it("strips the stree trailing colon without adding a level", () => {
    expect(parse("1:1:1:")).toEqual(parse("1:1:1"));
    expect(parse("1:1:1:")).toEqual({
      path: "1:1:1",
      level: 3,
      significant: [true, true, true],
    });
    expect(parse("1:")).toEqual(parse("1"));
  });

  it("parses insignificant levels when the path ends with a semicolon", () => {
    expect(parse("1:2;3;")).toEqual({
      path: "1:2:3",
      level: 3,
      significant: [true, false, false],
    });
    expect(parse("1;2:3;")).toEqual({
      path: "1:2:3",
      level: 3,
      significant: [false, true, false],
    });
  });

  it("parses insignificant levels when the semicolon is not last", () => {
    const treePath = new TreePath("1:2;3");
    expect(treePath.toString()).toBe("1:2");
    expect(treePath.level).toBe(2);
    expect(treePath.isSignificant(1)).toBe(false);
    expect(treePath.toArray().some(Number.isNaN)).toBe(false);
  });

  it("keeps array paths", () => {
    expect(parse([1, 2, 3])).toEqual(parse("1:2:3"));
  });
});

describe("TreePath.isAncestor", () => {
  it("requires a separator after the parent path", () => {
    expect(TreePath.isAncestor("root", "10:3")).toBe(true);
    expect(TreePath.isAncestor("1", "1:2")).toBe(true);
    expect(TreePath.isAncestor("1", "1:20:3")).toBe(true);
    expect(TreePath.isAncestor("1", "10")).toBe(false);
    expect(TreePath.isAncestor("1", "10:3")).toBe(false);
    expect(TreePath.isAncestor("1:2", "1:20")).toBe(false);
    expect(TreePath.isAncestor("1:2", "1:2")).toBe(false);
    expect(new TreePath("1:1").isAncestor("1:10:1")).toBe(false);
  });
});
