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
      } else if (entry.isFile() && (fullPath.match(/\.(js|ts|jsx|tsx)$/))) {
        filesMap[fullPath] = fullPath;
      }
    }
  }
  function getFileName(filePath) {
    return path.basename(filePath);
  }

  function resolveImport(importPath, currentFile, filesMap) {
    if (!importPath.startsWith(".")) return null; // ignore external packages

    const basePath = path.resolve(path.dirname(currentFile), importPath);

    const possibleExtensions = [".ts", ".tsx", ".js", ".jsx"];

    // Try direct file match
    for (const ext of possibleExtensions) {
      const fullPath = basePath + ext;
      if (filesMap[fullPath]) {
        return fullPath;
      }
    }

    // Try index file
    for (const ext of possibleExtensions) {
      const fullPath = path.join(basePath, "index" + ext);
      if (filesMap[fullPath]) {
        return fullPath;
      }
    }

    return null;
  }

  walk(folderPath);

  // parse each file
  for (let fullPath in filesMap) {
    const fileName = filesMap[fullPath];
    if (!graph.nodes.includes(fileName)) graph.nodes.push(fileName);

    const imports = parseFile(fullPath);
    for (let imp of imports) {
      const resolvedPath = resolveImport(imp, fullPath, filesMap);

      if (resolvedPath) {
        const targetName = getFileName(resolvedPath);

        if (!graph.nodes.includes(targetName)) {
          graph.nodes.push(targetName);
        }

        graph.links.push({
          source: fileName,
          target: targetName,
        });
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