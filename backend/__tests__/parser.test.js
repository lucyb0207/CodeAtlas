import { parseFile, parseFolderJS } from "../parser.js";
import fs from "fs-extra";
import path from "path";

describe("Parser", () => {
  const tempDir = path.join(process.cwd(), "tmp_test");

  beforeAll(() => {
    fs.ensureDirSync(tempDir);

    fs.writeFileSync(
      path.join(tempDir, "a.js"),
      `import b from "./b.js";`
    );

    fs.writeFileSync(
      path.join(tempDir, "b.js"),
      `export const b = 1;`
    );
  });

  afterAll(() => {
    fs.removeSync(tempDir);
  });

  test("parseFile extracts imports", () => {
    const imports = parseFile(path.join(tempDir, "a.js"));
    expect(imports).toContain("./b.js");
  });

  test("parseFolderJS returns graph", () => {
    const graph = parseFolderJS(tempDir);

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.links.length).toBeGreaterThan(0);
  });

  test("graph structure is valid", () => {
    const graph = parseFolderJS(tempDir);

    expect(graph).toHaveProperty("nodes");
    expect(graph).toHaveProperty("links");
    expect(graph).toHaveProperty("backLinks");
  });
});