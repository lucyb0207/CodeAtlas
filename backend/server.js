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
// CACHE
// -------------------------
const repoCache = new Map();

// -------------------------
// CLONE REPO
// -------------------------
async function cloneRepo(repoUrl) {
  await fs.remove(TEMP_DIR);
  await fs.mkdir(TEMP_DIR);

  await simpleGit().clone(repoUrl, TEMP_DIR, ["--depth", "1"]);
}

// -------------------------
// LIGHTWEIGHT INDEXER
// -------------------------
function buildIndex(dir) {
  const index = {};

  function walk(folder) {
    const items = fs.readdirSync(folder, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(folder, item.name);

      if (item.name === "node_modules" || item.name === ".git") continue;

      if (item.isDirectory()) {
        walk(fullPath);
      } else {
        if (
          !item.name.endsWith(".js") &&
          !item.name.endsWith(".ts") &&
          !item.name.endsWith(".tsx") &&
          !item.name.endsWith(".py")
        ) continue;

        try {
          const content = fs.readFileSync(fullPath, "utf-8");

          const imports = [
            ...content.matchAll(/from\s+['"](.*?)['"]/g),
            ...content.matchAll(/require\(['"](.*?)['"]\)/g),
          ].map((m) => m[1]);

          const relPath = path.relative(dir, fullPath);

          index[relPath] = {
            imports,
          };
        } catch {}
      }
    }
  }

  walk(dir);
  return index;
}

// -------------------------
// INIT REPO 
// -------------------------
app.post("/repo/init", async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl missing" });
  }

  try {
    console.log("Cloning repo...");

    await cloneRepo(repoUrl);

    console.log("Building index...");

    const index = buildIndex(TEMP_DIR);

    repoCache.set(repoUrl, index);

    return res.json({
      ok: true,
      files: Object.keys(index).length,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------
// GET NODE DETAILS
// -------------------------
app.get("/node", (req, res) => {
  const { repoUrl, path } = req.query;

  const repo = repoCache.get(repoUrl);

  if (!repo) {
    return res.status(404).json({ error: "Repo not initialized" });
  }

  const node = repo[path];

  if (!node) {
    return res.json({ nodes: [], links: [] });
  }

  const nodes = [{ id: path }];

  const links = (node.imports || []).map((imp) => ({
    source: path,
    target: imp,
  }));

  return res.json({
    nodes,
    links,
  });
});

// -------------------------
// INITIAL GRAPH (ROOT VIEW)
// -------------------------
app.get("/graph/root", (req, res) => {
  const { repoUrl } = req.query;

  const repo = repoCache.get(repoUrl);

  if (!repo) {
    return res.status(404).json({ error: "Repo not initialized" });
  }

  const firstFile = Object.keys(repo)[0];

  return res.json({
    nodes: [{ id: firstFile }],
    links: [],
  });
});

// -------------------------
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});