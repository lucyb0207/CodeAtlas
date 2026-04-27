import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // TEMP (until real auth)
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">

      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <button
        onClick={handleLogin}
        className="border px-6 py-2 rounded hover:bg-gray-100"
      >
        Sign in with GitHub
      </button>

      <button
        onClick={() => navigate("/")}
        className="mt-4 text-sm text-gray-400 hover:text-black"
      >
        ← Back to home
      </button>
    </div>
  );
}