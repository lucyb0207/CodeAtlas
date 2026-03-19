import { useState } from "react";
import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";

// types
type NodeType = {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

type LinkType = {
  source: string | NodeType;
  target: string | NodeType;
};

type GraphDataType = {
  nodes: NodeType[];
  links: LinkType[];
};

export default function App() {
  const [graphData, setGraphData] = useState<GraphDataType | null>(null);

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
        links: data.graph.links.map((l: any) => {
          // ensure links reference nodes by id
          return {
            source: typeof l.source === "string" ? l.source : l.source.id,
            target: typeof l.target === "string" ? l.target : l.target.id,
          };
        }),
      };

      console.log("Formatted graph:", formattedGraph);
      setGraphData(formattedGraph);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CodeAtlas</h1>

      <RepoInput onSubmit={handleAnalyze} />

      {graphData && <Graph data={graphData} />}
    </div>
  );
}