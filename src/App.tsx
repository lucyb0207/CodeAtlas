import RepoInput from "./components/RepoInput";
import Graph from "./components/Graph";

export default function App() {
  const handleSubmit = (url: string) => {
    console.log("Repo URL:", url);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">CodeAtlas</h1>
      <RepoInput onSubmit={handleSubmit} />
      <Graph />
    </div>
  );
}