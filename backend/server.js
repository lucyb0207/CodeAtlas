import express from "express";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const TEMP_DIR = path.join(process.cwd(), "tmp");

// -------------------------
// IGNORE HEAVY FOLDERS
// -------------------------
const IGNORE = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  "coverage",
  ".next",
  ".cache",
]);

// -------------------------
// CLONE 
// -------------------------
async function cloneRepo(repoUrl) {
  await fs.remove(TEMP_DIR);
  await fs.mkdir(TEMP_DIR);

  await simpleGit().clone(repoUrl, TEMP_DIR, ["--depth", "1"]);
}

// -------------------------
// FAST INDEXER 
// -------------------------
function buildIndex(dir) {
  const index = {};

  function walk(folder) {
    const items = fs.readdirSync(folder, { withFileTypes: true });

    for (const item of items) {
      if (IGNORE.has(item.name)) continue;

      const fullPath = path.join(folder, item.name);

      if (item.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (!item.name.match(/\.(js|ts|tsx|py)$/)) continue;

      try {
        const content = fs.readFileSync(fullPath, "utf8");

        const imports = [
          ...content.matchAll(/from\s+['"](.*?)['"]/g),
          ...content.matchAll(/require\(['"](.*?)['"]\)/g),
        ].map(m => m[1]);

        const rel = path.relative(dir, fullPath);

        index[rel] = {
          imports: imports.slice(0, 30), 
        };

      } catch (e) {
       
      }
    }
  }

  walk(dir);
  return index;
}

function resolveImport(file, imp, allFiles) {

  if (!imp.startsWith(".")) return null;

  const base = path.dirname(file);

  const possiblePaths = [
    path.normalize(path.join(base, imp)),
    path.normalize(path.join(base, imp + ".js")),
    path.normalize(path.join(base, imp + ".ts")),
    path.normalize(path.join(base, imp + ".tsx")),
    path.normalize(path.join(base, imp, "index.js")),
    path.normalize(path.join(base, imp, "index.ts")),
  ];

  for (const p of possiblePaths) {
    if (allFiles.has(p)) {
      return p;
    }
  }

  return null;
}

// -------------------------
// CONVERT INDEX → GRAPH
// -------------------------
function indexToGraph(index) {
  const fileList = Object.keys(index);
  const fileSet = new Set(fileList);

  const nodes = fileList.map(id => ({ id }));
  const links = [];

  for (const file of fileList) {
    for (const imp of index[file].imports) {
      const resolved = resolveImport(file, imp, fileSet);

      if (resolved) {
        links.push({
          source: file,
          target: resolved,
        });
      }
    }
  }

  return {
    nodes,
    links,
    backLinks: {},
  };
}

// -------------------------
// MAIN ROUTE
// -------------------------
app.post("/analyze", async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl missing" });
  }

  try {
    await cloneRepo(repoUrl);

    const index = buildIndex(TEMP_DIR);
    const graph = indexToGraph(index);

    return res.json({ graph });

  } catch (err) {
    console.error(err);

    return res.json({
      graph: {
        nodes: [],
        links: [],
        backLinks: {},
      },
      error: err.message,
    });
  }
});

// -------------------------
// FILE CONTENT
// -------------------------
app.get("/file", async (req, res) => {
  const { path: filePath } = req.query;

  try {
    const full = path.join(TEMP_DIR, filePath);
    const content = await fs.readFile(full, "utf8");

    res.json({ content });
  } catch (err) {
    res.json({ content: "" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});