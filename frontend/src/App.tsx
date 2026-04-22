import { useEffect, useMemo, useRef, useState } from "react";
import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";
import Editor from "@monaco-editor/react";

type Node = { id: string };

type Link = {
  source: string | Node;
  target: string | Node;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
  backLinks: Record<string, string[]>;
} | null;

const FileCopyMessages = {
  DEFAULT: "Copy File Path",
  SUCCESS: "Copied",
  FAILURE: "Copy failed"
}

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(true);
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState(FileCopyMessages.DEFAULT);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // For clearing timer

  const API = import.meta.env.DEV
    ? "http://localhost:8080"
    : "https://codeatlas-production-e4f8.up.railway.app";

  // Message timeout cleanup on unmount for the copy file path button
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // -------------------------
  // SAFE GRAPH FILTERING
  // -------------------------
  const displayData = useMemo(() => {
    if (!graphData) return null;
    if (!focusMode || !selectedFile) return graphData;

    const visited = new Set<string>();
    const queue: { id: string; level: number }[] = [
      { id: selectedFile, level: 0 },
    ];

    while (queue.length) {
      const { id, level } = queue.shift()!;

      if (visited.has(id) || level > depth) continue;
      visited.add(id);

      for (const l of graphData.links || []) {
        const source =
          typeof l.source === "string" ? l.source : l.source?.id;
        const target =
          typeof l.target === "string" ? l.target : l.target?.id;

        if (!source || !target) continue;

        if (source === id && !visited.has(target)) {
          queue.push({ id: target, level: level + 1 });
        }

        if (target === id && !visited.has(source)) {
          queue.push({ id: source, level: level + 1 });
        }
      }
    }

    return {
      nodes: (graphData.nodes || []).filter((n) => visited.has(n.id)),
      links: (graphData.links || []).filter((l) => {
        const s =
          typeof l.source === "string" ? l.source : l.source?.id;
        const t =
          typeof l.target === "string" ? l.target : l.target?.id;

        return s && t && visited.has(s) && visited.has(t);
      }),
      backLinks: graphData.backLinks || {},
    };
  }, [graphData, focusMode, selectedFile, depth]);

  // -------------------------
  // ANALYZE REPO 
  // -------------------------
  const handleAnalyze = async (url: string) => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: url }),
        }
      );

      const raw = await res.json();

      console.log("RAW RESPONSE:", raw);

      // -------------------------
      // SUPPORT BOTH BACKENDS
      // -------------------------
      const graph = raw.graph ?? raw;

      if (!graph?.nodes || !graph?.links) {
        console.error("Invalid graph response:", raw);
        setGraphData(null);
        return;
      }

      const formattedGraph: GraphData = {
        nodes: graph.nodes.map((n: any) =>
          typeof n === "string" ? { id: n } : n
        ),
        links: graph.links.map((l: any) => ({
          source:
            typeof l.source === "string" ? l.source : l.source?.id,
          target:
            typeof l.target === "string" ? l.target : l.target?.id,
        })),
        backLinks: graph.backLinks || {},
      };

      setGraphData(formattedGraph);
    } catch (err) {
      console.error("Analyze error:", err);
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // NODE CLICK
  // -------------------------
  const handleNodeClick = async (id: string) => {
    setSelectedFile(id);

    try {
      const res = await fetch(
        `${API}/file?path=${encodeURIComponent(id)}`
      );

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

  // -------------------------
  // File Inspector Helpers
  // -------------------------

  // Copies selected file path
  // Presents a success message on success, and a failure message otherwise (both for 1000ms)
  const copyFilePath = async () => {
    // Clearing timer
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    try {
      await navigator.clipboard.writeText(selectedFile || "");

      setCopyMessage(FileCopyMessages.SUCCESS);
    } catch (er) {
      console.error("Failed to Copy File Path", er);
      setCopyMessage(FileCopyMessages.FAILURE);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyMessage(FileCopyMessages.DEFAULT);
      copyTimeoutRef.current = null;
    }, 1000);
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="h-screen flex flex-col">

      {/* HEADER */}
      <div className="border-b p-4 flex items-center gap-4 bg-white">
        <h1 className="font-bold">CodeAtlas</h1>

        <RepoInput onSubmit={handleAnalyze} />

        <button
          onClick={() => setFocusMode(!focusMode)}
          className="border px-2 py-1 rounded"
        >
          {focusMode ? "Focus ON" : "Focus OFF"}
        </button>

        <div className="flex items-center gap-2">
          <span>Depth</span>
          <input
            type="range"
            min="1"
            max="5"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
          <span>{depth}</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* GRAPH */}
        <div className="flex-1 bg-gray-50 relative">
          {!graphData && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Enter a repo to start
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              Loading repo...
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
          <div className="w-80 border-l bg-white p-4 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">File Inspector</h2>
              <button
                type="button"
                className="inline text-sm float-right select-none cursor-pointer border border-black p-0.5 rounded-md hover:text-gray-600"
                onClick={copyFilePath}
              >
                {copyMessage}
              </button>
            </div>

            <p className="text-xs text-gray-500">FILE</p>
            <p className="font-mono text-sm mb-3">{selectedFile}</p>

            <p className="text-xs text-gray-500">IMPORTS</p>
            <ul className="text-sm mb-3">
              {(graphData.links || [])
                .filter((l) => {
                  const s =
                    typeof l.source === "string" ? l.source : l.source?.id;
                  return s === selectedFile;
                })
                .map((l, i) => {
                  const t =
                    typeof l.target === "string" ? l.target : l.target?.id;
                  return <li key={i}>→ {t}</li>;
                })}
            </ul>

            <p className="text-xs text-gray-500">DEPENDENTS</p>
            <ul className="text-sm">
              {(graphData.backLinks?.[selectedFile] || []).map((f, i) => (
                <li key={i}>← {f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* EDITOR */}
      {fileContent && (
        <div className="h-64 border-t">
          <Editor
            height="100%"
            language={getLanguage(selectedFile)}
            value={fileContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
            }}
          />
        </div>
      )}
    </div>
  );
}