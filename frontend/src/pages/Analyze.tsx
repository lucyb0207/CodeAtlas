import { useState, useMemo, useCallback } from "react";
import RepoInput from "../components/RepoInput";
import Graph from "../components/Graph";
import Editor from "@monaco-editor/react";
import "../styles/analyze.css";

type Node = { id: string };
type Link = { source: string | Node; target: string | Node };
type GraphData = { nodes: Node[]; links: Link[]; backLinks: Record<string, string[]> } | null;

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(true);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [repoUrl, setRepoUrl] = useState<string>("");

  const API = import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://codeatlas-production-e4f8.up.railway.app";


  const handleCopyPath = useCallback(() => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [selectedFile]);
  
  const handleOpenInGitHub = useCallback((): void => {
    if (!selectedFile || !repoUrl) return;

    const cleanRepoUrl = repoUrl.replace(/\.git$/, "");
    const branch = "main";

    const url = `${cleanRepoUrl}/blob/${branch}/${selectedFile}`;

    window.open(url, "_blank");
  }, [selectedFile, repoUrl]);

  const displayData = useMemo(() => {
    if (!graphData) return null;
    if (!focusMode || !selectedFile) return graphData;
    const visited = new Set<string>();
    const queue: { id: string; level: number }[] = [{ id: selectedFile, level: 0 }];
    while (queue.length) {
      const { id, level } = queue.shift()!;
      if (visited.has(id) || level > depth) continue;
      visited.add(id);
      for (const l of graphData.links || []) {
        const source = typeof l.source === "string" ? l.source : l.source?.id;
        const target = typeof l.target === "string" ? l.target : l.target?.id;
        if (!source || !target) continue;
        if (source === id && !visited.has(target)) queue.push({ id: target, level: level + 1 });
        if (target === id && !visited.has(source)) queue.push({ id: source, level: level + 1 });
      }
    }
    return {
      nodes: (graphData.nodes || []).filter((n) => visited.has(n.id)),
      links: (graphData.links || []).filter((l) => {
        const s = typeof l.source === "string" ? l.source : l.source?.id;
        const t = typeof l.target === "string" ? l.target : l.target?.id;
        return s && t && visited.has(s) && visited.has(t);
      }),
      backLinks: graphData.backLinks || {},
    };
  }, [graphData, focusMode, selectedFile, depth]);

  const handleAnalyze = async (url: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const raw = await res.json();
      const graph = raw.graph ?? raw;
      if (!graph?.nodes || !graph?.links) { setGraphData(null); return; }
      setGraphData({
        nodes: graph.nodes.map((n: any) => typeof n === "string" ? { id: n } : n),
        links: graph.links.map((l: any) => ({
          source: typeof l.source === "string" ? l.source : l.source?.id,
          target: typeof l.target === "string" ? l.target : l.target?.id,
        })),
        backLinks: graph.backLinks || {},
      });
      setRepoUrl(url);
    } catch (err) {
      console.error("Analyze error:", err);
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (id: string) => {
    setSelectedFile(id);
    try {
      const res = await fetch(`${API}/file?path=${encodeURIComponent(id)}`);
      const data = await res.json();
      setFileContent(data?.content || "");
    } catch (err) {
      console.error(err);
    }
  };

  const getLanguage = (file: string | null) => {
    if (!file) return "plaintext";
    if (file.endsWith(".ts") || file.endsWith(".tsx")) return "typescript";
    if (file.endsWith(".js") || file.endsWith(".jsx")) return "javascript";
    if (file.endsWith(".py")) return "python";
    return "plaintext";
  };


  return (
    <>

      <div className="ca-app">

        {/* HEADER */}
        <div className="ca-header">
          <div className="ca-logo">Code<span className="ca-logo-accent">Atlas</span></div>

          <div className="ca-repo-wrap">
            <RepoInput onSubmit={handleAnalyze} />
          </div>

          <button
            className={`ca-focus-btn${focusMode ? "" : " off"}`}
            onClick={() => setFocusMode(!focusMode)}
          >
            Focus {focusMode ? "ON" : "OFF"}
          </button>

          <div className="ca-depth">
            <span>Depth</span>
            <input
              type="range" min="1" max="5" value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
            />
            <span className="ca-depth-val">{depth}</span>
          </div>
        </div>

        {/* MAIN */}
        <div className="ca-main">

          {/* GRAPH */}
          <div className="ca-graph">
            {!graphData && !loading && (
              <div className="ca-empty">
                <div className="ca-empty-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/>
                    <line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/>
                  </svg>
                </div>
                <p>Enter a repo to start</p>
              </div>
            )}

            {loading && (
              <div className="ca-loading">
                <div className="ca-loading-dots">
                  <span /><span /><span />
                </div>
                <p>Analyzing repository...</p>
              </div>
            )}

            {graphData && (
              <Graph
                data={displayData}
                onNodeClick={handleNodeClick}
                selectedFile={selectedFile}
                search={search}
              />
            )}
          </div>

          {/* SIDEBAR */}
          {selectedFile && graphData && (
            <div className="ca-sidebar">
              <div className="ca-sidebar-head">
                <div className="ca-sidebar-title">File Inspector</div>
              </div>
              <div className="ca-sidebar-body">
                <div className="ca-label">File</div>
                <div className="flex items-center gap-1 mb-3">
                  <span className="ca-filepath">{selectedFile}</span>
                  <button
                    onClick={handleCopyPath}
                    className="ca-copy"
                    title="Copy file path"
                  >
                    {copied ? "✓" : "Copy"}
                  </button>
                  <div className="ca-copy"> | </div>
                  <button
                    onClick={handleOpenInGitHub}
                    className="ca-copy"
                    title="Open in GitHub"
                    disabled={!selectedFile}
                  >
                 GitHub
                  </button>
                </div>
               

                <div className="ca-label">Imports</div>
                <ul className="ca-list">
                  {(graphData.links || [])
                    .filter((l) => {
                      const s = typeof l.source === "string" ? l.source : l.source?.id;
                      return s === selectedFile;
                    })
                    .map((l, i) => {
                      const t = typeof l.target === "string" ? l.target : l.target?.id;
                      return <li key={i}><span className="arrow">→</span>{t}</li>;
                    })}
                </ul>

                <div className="ca-label">Dependents</div>
                <ul className="ca-list">
                  {(graphData.backLinks?.[selectedFile] || []).map((f, i) => (
                    <li key={i}><span className="arrow-back">←</span>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* EDITOR */}
        {fileContent && (
          <div className="ca-editor">
            <div className="ca-editor-tab">
              <div className="ca-editor-dot" />
              <span className="ca-editor-name">{selectedFile}</span>
            </div>
            <div className="ca-editor-body">
              <Editor
                height="100%"
                language={getLanguage(selectedFile)}
                value={fileContent}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
              />
            </div>
          </div>
          
        )}
      </div>
    </>
  );
}