import { useState } from "react";
import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";

export default function App() {
  const [graphData, setGraphData] = useState<any>(null);

  const handleSubmit = (url: string) => {
    console.log("Repo URL:", url);

    //  temp fake data
    setGraphData({
      nodes: [
        { id: "App.ts" },
        { id: "Auth.ts" },
        { id: "API.ts" }
      ],
      links: [
        { source: "App.ts", target: "Auth.ts" },
        { source: "App.ts", target: "API.ts" }
      ]
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CodeAtlas</h1>
      <RepoInput onSubmit={handleSubmit} />
      {graphData && <Graph data={graphData} />}
    </div>
  );
}