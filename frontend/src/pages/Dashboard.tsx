import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CodeAtlas</h1>

        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-black"
        >
          Logout
        </button>
      </div>

      {/* Main action */}
      <div className="border rounded p-6 mb-6">
        <h2 className="font-semibold mb-2">Start Analysis</h2>

        <button
          onClick={() => navigate("/analyze")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Analyze a Repository
        </button>
      </div>

      {/* Future sections */}
      <div className="space-y-4">
        <div className="border rounded p-4 text-sm text-gray-500">
          Recent analyses coming soon
        </div>

        <div className="border rounded p-4 text-sm text-gray-500">
          Saved graphs coming soon
        </div>
      </div>
    </div>
  );
}