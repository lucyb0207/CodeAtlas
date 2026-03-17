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