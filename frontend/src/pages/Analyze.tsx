import { useState, useMemo } from "react";
import RepoInput from "../components/RepoInput";
import Graph from "../components/Graph";
import Editor from "@monaco-editor/react";

type Node = { id: string };
type Link = { source: string | Node; target: string | Node };
type GraphData = { nodes: Node[]; links: Link[]; backLinks: Record<string, string[]> } | null;

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(true);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://codeatlas-production-e4f8.up.railway.app";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@300;400&display=swap');

        .ca-app { height: 100vh; display: flex; flex-direction: column; background: #050810; color: #e8eaf0; font-family: 'Syne', sans-serif; }

        /* HEADER */
        .ca-header {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.75rem 1.4rem; flex-shrink: 0;
          border-bottom: 1px solid rgba(56,189,248,0.1);
          background: rgba(5,8,16,0.95); backdrop-filter: blur(12px);
        }
        .ca-logo { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; flex-shrink: 0; }
        .ca-logo-accent { background: linear-gradient(90deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* REPO INPUT */
        .ca-repo-wrap {
          flex: 1; display: flex; align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(56,189,248,0.14);
          border-radius: 4px; overflow: hidden;
          transition: border-color 0.18s;
        }
        .ca-repo-wrap:focus-within { border-color: rgba(56,189,248,0.4); box-shadow: 0 0 0 3px rgba(56,189,248,0.06); }

        /* FOCUS TOGGLE */
        .ca-focus-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.16em; text-transform: uppercase;
          padding: 0.3rem 0.85rem; border-radius: 999px; cursor: pointer; flex-shrink: 0;
          border: 1px solid rgba(56,189,248,0.28); background: rgba(56,189,248,0.07);
          color: #38bdf8; transition: all 0.18s;
        }
        .ca-focus-btn:hover { background: rgba(56,189,248,0.14); }
        .ca-focus-btn.off { border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #334155; }

        /* DEPTH */
        .ca-depth {
          display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: #334155;
        }
        .ca-depth input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 68px; height: 3px; border-radius: 2px;
          background: rgba(56,189,248,0.18); outline: none; cursor: pointer;
        }
        .ca-depth input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 11px; height: 11px;
          border-radius: 50%; background: #38bdf8; cursor: pointer;
        }
        .ca-depth-val { color: #38bdf8; min-width: 8px; }

        /* MAIN */
        .ca-main { display: flex; flex: 1; overflow: hidden; }

        /* GRAPH */
        .ca-graph {
          flex: 1; position: relative;
          background: #050810;
          background-image:
            linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .ca-empty {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .ca-empty-icon {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.15);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.3rem;
        }
        .ca-empty p {
          font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: #1e293b;
        }
        .ca-loading {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.8rem;
        }
        .ca-loading-dots { display: flex; gap: 0.4rem; }
        .ca-loading-dots span {
          width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;
          animation: caDotPulse 1.2s ease-in-out infinite;
        }
        .ca-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ca-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes caDotPulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8);} 40%{opacity:1;transform:scale(1);} }
        .ca-loading p {
          font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
          letter-spacing: 0.14em; text-transform: uppercase; color: #334155;
        }

        /* SIDEBAR */
        .ca-sidebar {
          width: 272px; flex-shrink: 0;
          border-left: 1px solid rgba(56,189,248,0.08);
          background: rgba(5,8,16,0.92);
          display: flex; flex-direction: column; overflow: hidden;
        }
        .ca-sidebar-head {
          padding: 0.9rem 1.1rem 0.75rem;
          border-bottom: 1px solid rgba(56,189,248,0.08);
          flex-shrink: 0;
        }
        .ca-sidebar-title {
          font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
          letter-spacing: 0.2em; text-transform: uppercase; color: #334155;
        }
        .ca-sidebar-body { padding: 1rem 1.1rem; overflow-y: auto; flex: 1; }

        .ca-label {
          font-family: 'JetBrains Mono', monospace; font-size: 0.58rem;
          letter-spacing: 0.2em; text-transform: uppercase; color: #1e293b; margin-bottom: 0.3rem;
        }
        .ca-filepath {
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
          color: #38bdf8; margin-bottom: 1rem; word-break: break-all; line-height: 1.6;
        }
        .ca-list { list-style: none; margin-bottom: 1rem; }
        .ca-list li {
          font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
          color: #475569; padding: 0.22rem 0;
          border-bottom: 1px solid rgba(56,189,248,0.04);
          display: flex; align-items: center; gap: 0.4rem;
        }
        .ca-list li .arrow { color: #38bdf8; font-size: 0.6rem; }
        .ca-list li .arrow-back { color: #818cf8; font-size: 0.6rem; }

        /* EDITOR */
        .ca-editor {
          flex-shrink: 0;
          border-top: 1px solid rgba(56,189,248,0.08);
          background: #0d1117;
          display: flex; flex-direction: column;
          height: 256px;
        }
        .ca-editor-tab {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.38rem 1rem;
          border-bottom: 1px solid rgba(56,189,248,0.08);
          flex-shrink: 0;
        }
        .ca-editor-dot { width: 6px; height: 6px; border-radius: 50%; background: #38bdf8; }
        .ca-editor-name {
          font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: #475569;
        }
        .ca-editor-body { flex: 1; overflow: hidden; }
      `}</style>

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
                <div className="ca-filepath">{selectedFile}</div>

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