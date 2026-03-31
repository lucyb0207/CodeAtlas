import express from "express";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import { parseFolderJS } from "./parser.js";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors())
app.use(express.json());

const PORT = 5050;
const TEMP_DIR = path.join(process.cwd(), "tmp"); 

function runPythonParser(folderPath) {
  return new Promise((resolve, reject) => {
    exec(`python3 parser_py.py "${folderPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(stderr);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject("Invalid JSON from Python parser");
        }
      }
    });
  });
}

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

function mergeGraphs(g1, g2) {
  const nodeMap = new Map();

  const addNode = (n) => {
    if (!nodeMap.has(n.id)) {
      nodeMap.set(n.id, n);
    }
  };

  g1.nodes.forEach(addNode);
  g2.nodes.forEach(addNode);

  const links = [...g1.links, ...g2.links];

  return {
    nodes: Array.from(nodeMap.values()),
    links,
    backLinks: {
      ...(g1.backLinks || {}),
      ...(g2.backLinks || {}),
    },
  };
}

app.post("/analyze", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl missing" });

  await fs.remove(TEMP_DIR);
  await fs.mkdir(TEMP_DIR);

  try {
    await simpleGit().clone(repoUrl, TEMP_DIR);

    const jsGraph = parseFolderJS(TEMP_DIR);
    const pyGraph = await runPythonParser(TEMP_DIR);

    const graph = mergeGraphs(jsGraph, pyGraph);

    res.json({ graph });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

app.get("/file", async (req, res) => {
  const { path: filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ error: "Missing file path" });
  }

  try {
    const fullPath = path.join(TEMP_DIR, filePath);
    const content = await fs.readFile(fullPath, "utf-8");

    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});