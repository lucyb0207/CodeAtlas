import { parseFile } from "./parser.js";
import path from "path";

// Use a small local repo or folder
const filePath = path.resolve("../frontend/src/App.tsx");

const imports = parseFile(filePath);
console.log("Imports found:", imports);