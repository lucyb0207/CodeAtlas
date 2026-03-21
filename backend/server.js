import express from "express";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs-extra";
import { parseFolder } from "./parser.js";
import cors from "cors";

const app = express();
app.use(cors())
app.use(express.json());

const PORT = 5050;
const TEMP_DIR = path.join(process.cwd(), "tmp"); 

app.post("/analyze", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl missing" });

  await fs.remove(TEMP_DIR);
  await fs.mkdir(TEMP_DIR);

  try {
    await simpleGit().clone(repoUrl, TEMP_DIR);

    const graph = parseFolder(TEMP_DIR);

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