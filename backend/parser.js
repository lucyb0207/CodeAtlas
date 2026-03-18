import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";

export function parseFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const imports = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      imports.push(node.source.value);
    },
  });
  return imports;
}

// recursively walk a folder and parse all .js/.ts files
export function parseFolder(folderPath) {
  const graph = { nodes: [], links: [] };
  const filesMap = {}; // map filename → full path

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (fullPath.endsWith(".js") || fullPath.endsWith(".ts"))) {
        filesMap[fullPath] = entry.name;
      }
    }
  }

  walk(folderPath);

  // parse each file
  for (let fullPath in filesMap) {
    const fileName = filesMap[fullPath];
    if (!graph.nodes.includes(fileName)) graph.nodes.push(fileName);

    const imports = parseFile(fullPath);
    for (let imp of imports) {
      const impFile = Object.values(filesMap).find(f => f === imp || f.endsWith(imp));
      if (impFile) {
        if (!graph.nodes.includes(impFile)) graph.nodes.push(impFile);
        graph.links.push({ source: fileName, target: impFile });
      }
    }
  }

  return graph;
}