import { useState } from "react";
import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";
import Editor from "@monaco-editor/react";

type Node = {
  id: string;
};

type Link = {
  source: string | Node;
  target: string | Node;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
  backLinks: Record<string, string[]>;
} | null;

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(true);
  const [depth, setDepth] = useState(2);

  const filteredNodes =
    graphData?.nodes.filter((n) =>
      n.id.toLowerCase().includes(search.toLowerCase())
    ) || [];


  let displayData = graphData;

  if (focusMode && selectedFile && graphData) {
    const visited = new Set<string>();
    const queue: { id: string; level: number }[] = [
      { id: selectedFile, level: 0 },
    ];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      if (visited.has(id) || level > depth) continue;
      visited.add(id);

      graphData.links.forEach((l) => {
        const source = typeof l.source === "string" ? l.source : l.source.id;
        const target = typeof l.target === "string" ? l.target : l.target.id;

        if (source === id && !visited.has(target)) {
          queue.push({ id: target, level: level + 1 });
        }

        if (target === id && !visited.has(source)) {
          queue.push({ id: source, level: level + 1 });
        }
      });
    }

    displayData = {
      nodes: graphData.nodes.filter((n) => visited.has(n.id)),
      links: graphData.links.filter((l) => {
        const source = typeof l.source === "string" ? l.source : l.source.id;
        const target = typeof l.target === "string" ? l.target : l.target.id;

        return visited.has(source) && visited.has(target);
      }),
      backLinks: graphData.backLinks,
    };
  }

  const handleAnalyze = async (url: string) => {
    const res = await fetch("https://codeatlas-production-e4f8.up.railway.app/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl: url }),
    });

    const data = await res.json();

    const formattedGraph = {
      nodes: data.graph.nodes.map((n: any) =>
        typeof n === "string" ? { id: n } : n
      ),
      links: data.graph.links.map((l: any) => ({
        source: typeof l.source === "string" ? l.source : l.source.id,
        target: typeof l.target === "string" ? l.target : l.target.id,
      })),
      backLinks: data.graph.backLinks || {},
    };

    setGraphData(formattedGraph);
  };

  const handleNodeClick = async (id: string) => {
    setSelectedFile(id);

    const res = await fetch(
      `https://codeatlas-production-e4f8.up.railway.app/file?path=${encodeURIComponent(id)}`
    );

    const data = await res.json();
    setFileContent(data.content);
  };

  const getLanguage = (file: string | null) => {
    if (!file) return "plaintext";
    if (file.endsWith(".ts") || file.endsWith(".tsx")) return "typescript";
    if (file.endsWith(".js") || file.endsWith(".jsx")) return "javascript";
    if (file.endsWith(".py")) return "python";
    return "plaintext";
  };

  return (
    <div className="h-screen flex flex-col">

      {/* 🔝 HEADER */}
      <div className="border-b p-4 flex items-center gap-4 bg-white">
        <h1 className="text-xl font-bold">CodeAtlas</h1>
        <RepoInput onSubmit={handleAnalyze} />
        <button
          onClick={() => setFocusMode(!focusMode)}
          className="border px-3 py-1 rounded"
        >
          {focusMode ? "Focus: ON" : "Focus: OFF"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm">Depth:</span>
          <input
            type="range"
            min="1"
            max="5"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
          />
          <span className="text-sm">{depth}</span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-64"
          />

          {search && (
            <div className="absolute top-full mt-1 w-64 bg-white border shadow max-h-40 overflow-auto z-10">
              {filteredNodes.slice(0, 10).map((n, i) => (
                <div
                  key={i}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedFile(n.id);
                    setSearch("");
                  }}
                >
                  {n.id}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧠 MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* 🌐 GRAPH */}
        <div className="flex-1 relative bg-gray-50">
          {!graphData && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Paste a GitHub repo to visualise it
            </div>
          )}

          {graphData && (
            <div className="w-full h-full">
              
              <Graph
                data={displayData}
                onNodeClick={handleNodeClick}
                selectedFile={selectedFile}
                search={search}
              />
            </div>
          )}
        </div>

        {/* 📊 SIDEBAR */}
        {selectedFile && graphData && (
          <div className="w-80 border-l bg-white p-4 overflow-auto">
            <h2 className="text-lg font-semibold mb-4">File Inspector</h2>

            <div className="mb-4">
              <p className="text-xs text-gray-500">FILE</p>
              <p className="font-mono text-sm">{selectedFile}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">IMPORTS</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {graphData.links
                  .filter((l) => {
                    const source =
                      typeof l.source === "string" ? l.source : l.source.id;
                    return source === selectedFile;
                  })
                  .map((l, i) => {
                    const target =
                      typeof l.target === "string" ? l.target : l.target.id;
                    return <li key={i}>→ {target}</li>;
                  })}
              </ul>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">DEPENDENTS</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {(graphData.backLinks[selectedFile] || []).map((f, i) => (
                  <li key={i}>← {f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 💻 BOTTOM EDITOR */}
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
              wordWrap: "on",
            }}
          />
        </div>
      )}
    </div>
  );
}