import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    navigate("/dashboard");
  };

  const handleGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) console.error(error);
  };

  return (
    <div className="ca-login-root">
      <canvas className="ca-login-canvas" />
      <div className="ca-login-grid" />
      <div className="ca-login-orb ca-login-orb1" />
      <div className="ca-login-orb ca-login-orb2" />

      {/* LOGIN CARD */}
      <div className="ca-login-card">
        <div className="ca-login-logo">
          Code<span className="ca-login-accent">Atlas</span>
        </div>

        <div className="ca-login-tagline">// visual code intelligence</div>

        <div className="ca-login-divider" />

        <div className="ca-login-label">Continue with</div>

        <button className="ca-github-btn" onClick={handleGitHub}>
          Sign in with GitHub
        </button>
        <div className="ca-email-box">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        </div>

        <button className="ca-github-btn" onClick={handleLogin}>Login</button>

        <button className="ca-back-btn" onClick={() => navigate("/signup")}>
          No account? Sign up
        </button>
      </div>
    </div>
  );
}