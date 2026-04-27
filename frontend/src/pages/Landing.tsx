import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">

      <h1 className="text-4xl font-bold mb-4 text-center">
        CodeAtlas
      </h1>

      <p className="text-gray-500 mb-8 text-center max-w-xl">
        Understand any codebase visually.  
        Turn repositories into interactive dependency graphs.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Get Started
      </button>

      <p className="mt-4 text-sm text-gray-400">
        No setup required
      </p>
    </div>
  );
}