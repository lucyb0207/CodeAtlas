import { useState } from "react";
import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";
import Editor from "@monaco-editor/react";

type Node = {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type Link = {
  source: string | Node;
  target: string | Node;
};

type GraphData = {
  nodes: Node[];
  links: Link[];
  backLinks: Record<string, string[]>;
}| null;

export default function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fileContent, setFileContent] = useState<string | null>(null);
  
  
  const filteredNodes =
    graphData?.nodes.filter((n) =>
      n.id.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const handleAnalyze = async (url: string) => {
    try {
      const res = await fetch("http://localhost:5050/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: url }),
      });

      const data = await res.json();
      console.log("Raw data:", data);

      // Format nodes: convert strings into objects with `id`
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

      console.log("Formatted graph:", formattedGraph);
      setGraphData(formattedGraph);
    } catch (err) {
      console.error("Error:", err);
    }
  };
  const handleNodeClick = async (id: string) => {
      setSelectedFile(id);

      try {
        const res = await fetch(
          `http://localhost:5050/file?path=${encodeURIComponent(id)}`
        );

        const data = await res.json();
        setFileContent(data.content);
      } catch (err) {
        console.error(err);
      }
  };
  const getLanguage = (file: string | null) => {
    if (!file) return "plaintext";
    if (file.endsWith(".ts") || file.endsWith(".tsx")) return "typescript";
    if (file.endsWith(".js") || file.endsWith(".jsx")) return "javascript";
    if (file.endsWith(".json")) return "json";
    return "plaintext";
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CodeAtlas</h1>

      <RepoInput onSubmit={handleAnalyze} />
      <input
          type="text"
          placeholder="Search file..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-80"
      />
      {search && (
        <div className="border w-80 bg-white max-h-40 overflow-auto">
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

      {graphData && <Graph
        data={graphData}
        onNodeClick={handleNodeClick}
        selectedFile={selectedFile}
        search={search}
      />}
      {selectedFile && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white border-l p-4 overflow-auto">
          <h2 className="font-bold text-lg mb-2">File Inspector</h2>
          <p className="text-sm text-gray-700">{selectedFile}</p>

          <div className="mt-4 text-xs text-gray-500">
            (Next step: show imports + file contents here)
          </div>
        </div>
      )}
      {selectedFile && graphData && (

        <div className="fixed right-0 top-0 w-80 h-full bg-white border-l p-4 overflow-auto">
          <h2 className="font-bold text-lg mb-3">File Inspector</h2>

          <div className="text-sm">
            <p className="font-semibold">📄 File:</p>
            <p className="mb-4">{selectedFile}</p>

            <p className="font-semibold">📥 Imports (used by this file):</p>
            <ul className="list-disc ml-5 text-gray-600">
              {graphData.links
                .filter((l) => {
                  const source =
                    typeof l.source === "string" ? l.source : l.source.id;

                  return source === selectedFile;
                })
                .map((l, i) => {
                  const target =
                    typeof l.target === "string" ? l.target : l.target.id;

                  return <li key={i}>{target}</li>;
                })}
            </ul>
          

            <p className="font-semibold mt-4">📤 Dependents (uses this file):</p>
            <ul className="list-disc ml-5 text-gray-600">
              {(graphData.backLinks[selectedFile] || []).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
          {fileContent && (
            <div className="fixed bottom-0 left-0 w-full h-72 border-t">
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
      )}
    </div>
    
  );
}