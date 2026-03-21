import { parseFile } from "./parser.js";
import path from "path";

const filePath = path.resolve("../frontend/src/App.tsx");

const imports = parseFile(filePath);
console.log("Imports found:", imports);