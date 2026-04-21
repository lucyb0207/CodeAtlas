import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";

const IGNORE = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
]);

export function parseFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "unambiguous",
      plugins: [
        "typescript",
        "jsx",
        "dynamicImport",
        "classProperties",
      ],
      errorRecovery: true,
    });

    const imports = [];

    traverse.default(ast, {
      ImportDeclaration({ node }) {
        imports.push(node.source.value);
      },
      CallExpression({ node }) {
        if (
          node.callee.name === "require" &&
          node.arguments.length === 1 &&
          node.arguments[0].type === "StringLiteral"
        ) {
          imports.push(node.arguments[0].value);
        }
      },
    });

    return imports;
  } catch (err) {

    return [];
  }
}

export function parseFolderJS(folderPath) {
  const graph = { nodes: [], links: [], backLinks: {} };
  const filesMap = {};

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (let entry of entries) {
      if (IGNORE.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && fullPath.match(/\.(js|ts|jsx|tsx)$/)) {
        filesMap[fullPath] = fullPath;
      }
    }
  }

  function toRelative(filePath) {
    return path.relative(folderPath, filePath).replace(/\\/g, "/");
  }

  walk(folderPath);

  for (let fullPath in filesMap) {
    const fileId = toRelative(fullPath);

    graph.nodes.push({ id: fileId });

    const imports = parseFile(fullPath);

    for (let imp of imports) {
      if (!imp.startsWith(".")) continue;

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

      const found = possible.find((p) => filesMap[p]);

      if (found) {
        const targetId = toRelative(found);

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

  graph.links = Array.from(
    new Set(graph.links.map((l) => `${l.source}->${l.target}`))
  ).map((str) => {
    const [source, target] = str.split("->");
    return { source, target };
  });

  return graph;
}