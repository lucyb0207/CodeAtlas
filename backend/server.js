import express from "express";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import cors from "cors";
import { parseFolderJS } from "./parser.js";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const TEMP_DIR = path.join(process.cwd(), "tmp");


// -------------------------
// PYTHON PARSER
// -------------------------
function runPythonParser(folderPath) {
  return new Promise((resolve, reject) => {
    exec(
      `python3 parser_py.py "${folderPath}"`,
      { timeout: 30000 }, // prevent hanging
      (error, stdout, stderr) => {
        if (error) {
          console.error("Python error:", stderr || error.message);
          return reject(stderr || error.message);
        }

        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          reject("Invalid JSON from Python parser");
        }
      }
    );
  });
}


// -------------------------
// DETECT PY FILES
// -------------------------
function hasPythonFiles(dir) {
  let found = false;

  function scan(folder) {
    const items = fs.readdirSync(folder, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(folder, item.name);

      if (item.isDirectory()) {
        scan(fullPath);
      } else if (item.name.endsWith(".py")) {
        found = true;
      }
    }
  }

  scan(dir);
  return found;
}


// -------------------------
// MERGE GRAPHS SAFELY
// -------------------------
function mergeGraphs(g1, g2) {
  if (!g1 && !g2) return { nodes: [], links: [], backLinks: {} };
  if (!g1) return g2;
  if (!g2) return g1;

  const nodeMap = new Map();

  const addNode = (n) => {
    if (n?.id && !nodeMap.has(n.id)) {
      nodeMap.set(n.id, n);
    }
  };

  (g1.nodes || []).forEach(addNode);
  (g2.nodes || []).forEach(addNode);

  return {
    nodes: Array.from(nodeMap.values()),
    links: [...(g1.links || []), ...(g2.links || [])],
    backLinks: {
      ...(g1.backLinks || {}),
      ...(g2.backLinks || {}),
    },
  };
}


// -------------------------
// ANALYZE REPO (MAIN ROUTE)
// -------------------------
app.post("/analyze", async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl missing" });
  }

  try {
    console.log("Cloning repo...");

    await fs.remove(TEMP_DIR);
    await fs.mkdir(TEMP_DIR);

    await simpleGit().clone(repoUrl, TEMP_DIR, ["--depth", "1"]);

    console.log("Parsing JS...");

    const jsGraph = parseFolderJS(TEMP_DIR);

    let graph = jsGraph;

    // -------------------------
    // PYTHON (OPTIONAL)
    // -------------------------
    if (hasPythonFiles(TEMP_DIR)) {
      try {
        console.log("Python detected → parsing...");

        const pyGraph = await runPythonParser(TEMP_DIR);

        if (pyGraph?.nodes && pyGraph?.links) {
          graph = mergeGraphs(jsGraph, pyGraph);
        }

      } catch (err) {
        console.error("Python parser failed:", err);
      }
    }

    console.log("Returning graph...");

    return res.json({ graph });

  } catch (err) {
    console.error("ANALYZE ERROR:", err);

    return res.status(500).json({
      error: err.message || "Internal server error"
    });
  }
});


// -------------------------
// FILE CONTENT ROUTE
// -------------------------
app.get("/file", async (req, res) => {
  const { path: filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "Missing file path" });
  }

  try {
    const fullPath = path.join(TEMP_DIR, filePath);
    const content = await fs.readFile(fullPath, "utf-8");

    return res.json({ content });

  } catch (err) {
    console.error("FILE ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
});


// -------------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});