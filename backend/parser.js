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

export function parseFolderJS(folderPath) {
  const graph = { nodes: [], links: [] };
  const filesMap = {}; 
  graph.backLinks = {};

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (fullPath.match(/\.(js|ts|jsx|tsx)$/))) {
        filesMap[fullPath] = fullPath;
      }
    }
  }
  function getFileName(filePath) {
    return path.basename(filePath);
  }
  function toRelative(filePath, base) {
    return path.relative(base, filePath).replace(/\\/g, "/");
  }

  walk(folderPath);

  for (let fullPath in filesMap) {
    const fileId = toRelative(fullPath, folderPath).replace(/\\/g, "/");

    if (!graph.nodes.find(n => n.id === fileId)) {
      graph.nodes.push({ id: fileId });
    }

    const imports = parseFile(fullPath);

    for (let imp of imports) {
      if (imp.startsWith(".")) {
        let resolved = path.resolve(path.dirname(fullPath), imp);

        const possible = [
          resolved,
          resolved + ".ts",
          resolved + ".tsx",
          resolved + ".js",
          resolved + ".jsx",
          resolved + "/index.ts",
          resolved + "/index.tsx",
          resolved + "/index.js",
          resolved + "/index.jsx",
        ];

        const found = possible.find(p => filesMap[p]);

        if (found) {
          const targetId = toRelative(found, folderPath);

          graph.links.push({
            source: fileId,
            target: targetId,
          });

          if (!graph.backLinks[targetId]) {
            graph.backLinks[targetId] = [];
          }

          graph.backLinks[targetId].push(fileId);
        }
      }
    }
  }
  graph.links = Array.from(
    new Set(graph.links.map(l => `${l.source}->${l.target}`))
  ).map(str => {
    const [source, target] = str.split("->");
    return { source, target };
  });


  return graph;
}