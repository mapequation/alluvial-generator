import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import Diagram from "../alluvial/Diagram";
import * as parsers from ".";
import { parseAcceptedFiles } from "./parse-files";

const FORMATS = ["tree", "ftree", "stree", "clu", "json", "net", "zip"];

function jsonFile(name: string, value: unknown) {
  return new File([JSON.stringify(value)], name, {
    type: "application/json",
    lastModified: 0,
  });
}

describe("parseAcceptedFiles", () => {
  it("rejects a 2019 saved diagram (top-level networks, no nodes)", async () => {
    const saved = {
      version: "0.3.0",
      timestamp: 0,
      state: {},
      networks: [
        {
          id: "a",
          name: "a",
          moduleNames: [],
          nodes: [{ path: "1:1", flow: 1, id: 1 }],
        },
      ],
    };
    const [files, errors] = await parseAcceptedFiles(
      [jsonFile("diagram.json", saved)],
      [],
      FORMATS,
      "id"
    );
    expect(files).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].errors[0].code).toBe("invalid-format");
  });

  it("still reads Infomap JSON", async () => {
    const [files, errors] = await parseAcceptedFiles(
      [jsonFile("net.json", { nodes: [{ path: "1:1", flow: 1, id: 1 }] })],
      [],
      FORMATS,
      "id"
    );
    expect(errors).toEqual([]);
    expect(files).toHaveLength(1);
    expect(files[0].nodes).toHaveLength(1);
  });
});

function textFile(name: string, text: string, type = "") {
  return new File([text], name, { type, lastModified: 0 });
}

const TREE = (flow: string) =>
  `# path flow name node_id\n1:1 0.5 "a" 1\n1:2 0.25 "b" 2\n2:1 ${flow} "c" 3\n`;

async function parse(files: File[]) {
  return parseAcceptedFiles(files, [], FORMATS, "id");
}

describe("load validation (fix round WP4)", () => {
  it("reads an upper-case extension like a lower-case one (P1)", async () => {
    const [files, errors] = await parse([textFile("x.TREE", TREE("0.25"))]);
    expect(errors).toEqual([]);
    expect(files[0].format).toBe("tree");
    expect(files[0].nodes.map((node) => node.identifier)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("rejects unknown extensions as invalid-format (P1)", async () => {
    for (const name of ["x.txt", "x", "x.zip.bak"]) {
      const [files, errors] = await parse([textFile(name, TREE("0.25"))]);
      expect(files).toEqual([]);
      expect(errors[0].errors[0].code).toBe("invalid-format");
    }
  });

  it("rejects a format that is not accepted", async () => {
    const [files, errors] = await parseAcceptedFiles(
      [textFile("x.clu", "# node_id module flow\n1 1 1\n")],
      [],
      ["tree"],
      "id"
    );
    expect(files).toEqual([]);
    expect(errors[0].errors[0].code).toBe("invalid-format");
  });

  for (const [type, name] of [
    ["application/x-zip-compressed", "networks.zip"],
    ["application/x-zip", "networks.zip"],
    ["application/zip", "networks"],
    ["", "networks.ZIP"],
  ]) {
    it(`reads a zip sent as "${type}" named ${name} (P2)`, async () => {
      const zip = new JSZip();
      zip.folder("dir");
      zip.file("dir/a.TREE", TREE("0.25"));
      zip.file("__MACOSX/dir/._a.TREE", "binary");
      zip.file("dir/._b.tree", "binary");
      zip.file(
        "b.json",
        JSON.stringify({ nodes: [{ path: [1, 1], flow: 1, id: 1 }] })
      );
      const blob = await zip.generateAsync({ type: "arraybuffer" });
      const [files, errors] = await parse([
        new File([blob], name, { type, lastModified: 0 }),
      ]);
      expect(errors).toEqual([]);
      expect(files.map((file) => [file.name, file.format])).toEqual([
        ["dir/a.TREE", "tree"],
        ["b.json", "json"],
      ]);
    });
  }

  for (const token of ["NaN", "Infinity", "-Infinity", "1e400", "abc"]) {
    it(`rejects a ${token} flow as invalid-format (E9)`, async () => {
      const [files, errors] = await parse([textFile("x.tree", TREE(token))]);
      expect(files).toEqual([]);
      expect(errors[0].errors[0]).toEqual({
        code: "invalid-format",
        message: expect.stringContaining("Node 3 has no finite flow"),
      });
    });
  }

  for (const node of [
    { path: [1, 1], id: 1, flow: null },
    { path: [1, 1], id: 1, flow: "0.5" },
    { path: [1, 1], id: 1 },
  ]) {
    it(`rejects the JSON flow ${JSON.stringify(node.flow)} (E9)`, async () => {
      const [files, errors] = await parse([
        jsonFile("x.json", { nodes: [node] }),
      ]);
      expect(files).toEqual([]);
      expect(errors[0].errors[0].code).toBe("invalid-format");
    });
  }

  it("keeps finite oddities", async () => {
    for (const token of ["-0.1", "-0", "0e0"]) {
      const [files, errors] = await parse([textFile("x.tree", TREE(token))]);
      expect(errors).toEqual([]);
      expect(Number.isFinite(files[0].nodes[2].flow)).toBe(true);
    }
  });

  it("accepts a .net file, which has no nodes before Infomap runs", async () => {
    const net = '*Vertices 2\n1 "a"\n2 "b"\n*Edges 1\n1 2\n';
    const [files, errors] = await parse([textFile("x.net", net)]);
    expect(errors).toEqual([]);
    expect(files[0]).toMatchObject({ format: "net", haveModules: false });
  });

  it("loads a file with duplicate identifiers and warns once (E6)", async () => {
    const tree =
      '# path flow name node_id\n1:1 0.3 "a" 1\n1:2 0.3 "a" 2\n' +
      '2:1 0.2 "b" 3\n2:2 0.2 "b" 4\n';
    const [byId, idWarnings] = await parse([textFile("x.tree", tree)]);
    expect(idWarnings).toEqual([]);
    expect(byId).toHaveLength(1);

    const [files, warnings] = await parseAcceptedFiles(
      [textFile("x.tree", tree)],
      [],
      FORMATS,
      "name"
    );
    expect(files).toHaveLength(1);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].warning).toBe(true);
    expect(warnings[0].errors).toHaveLength(1);
    expect(warnings[0].errors[0].code).toBe("duplicate-identifiers");
    expect(warnings[0].errors[0].message).toMatch(/^2 identifier\(s\)/);
  });

  it("validateNetworkNodes is exported", () => {
    expect(() => parsers.validateNetworkNodes([{ flow: 0 }])).not.toThrow();
    expect(() => parsers.validateNetworkNodes(undefined)).toThrow("no nodes");
  });
});

describe("insignificant string paths in Infomap JSON", () => {
  it("keeps the semicolon path and creates no NaN module", async () => {
    const nodes = [
      { path: "1;1;3;", flow: 0.5, id: 1 },
      { path: "1:2;1;", flow: 0.25, id: 2 },
      { path: "2:1", flow: 0.25, id: 3 },
    ];
    const [files, errors] = await parseAcceptedFiles(
      [jsonFile("insignificant.json", { nodes })],
      [],
      FORMATS,
      "id"
    );
    expect(errors).toEqual([]);
    expect(files[0].nodes.map((node) => node.path)).toEqual([
      "1;1;3;",
      "1:2;1;",
      [2, 1],
    ]);

    const diagram = new Diagram(files);
    const moduleIds = diagram
      .getNetwork(files[0].id)!
      .children.map((module) => module.moduleId)
      .sort();
    expect(moduleIds).toEqual(["1", "2"]);
  });
});

describe("calcStatistics", () => {
  it("ignores the stree trailing colon", () => {
    const stats = parsers.calcStatistics([
      { path: "1:1:1:", flow: 0.5 },
      { path: "1:2:", flow: 0.5 },
    ]);
    expect(stats.numLevels).toBe(3);
  });
});

describe("parsers", () => {
  it("no longer exports the 2019 saved-diagram loader", () => {
    expect("createFilesFromDiagramObject" in parsers).toBe(false);
  });
});
