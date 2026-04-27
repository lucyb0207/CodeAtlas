import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Login() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLogin = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; pulse: number };
    let nodes: Node[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const initNodes = () => {
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.8,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.012;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      const maxDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.35;
            ctx.strokeStyle = Math.random() > 0.85
              ? `rgba(99,102,241,${alpha})`
              : `rgba(56,189,248,${alpha * 0.7})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const p = 0.5 + 0.5 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.85 + 0.15 * p), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${0.5 + 0.4 * p})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@300;400&display=swap');

        .ca-login-root {
          background: #050810;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          font-family: 'Syne', sans-serif;
          color: #e8eaf0;
        }
        .ca-login-canvas { position: fixed; inset: 0; z-index: 0; opacity: 0.45; }
        .ca-login-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .ca-login-orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .ca-login-orb1 { width: 360px; height: 360px; background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%); top: -80px; right: -60px; }
        .ca-login-orb2 { width: 260px; height: 260px; background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%); bottom: -60px; left: -40px; }

        .ca-login-card {
          position: relative; z-index: 10;
          background: rgba(8, 14, 28, 0.82);
          border: 1px solid rgba(56,189,248,0.12);
          border-radius: 8px;
          padding: 3rem 3rem 2.6rem;
          width: 100%; max-width: 400px;
          backdrop-filter: blur(18px);
          box-shadow: 0 0 0 1px rgba(56,189,248,0.07), 0 32px 80px rgba(0,0,0,0.5);
          animation: caLoginUp 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes caLoginUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ca-login-logo {
          font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
          animation: caLoginUp 0.8s 0.08s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-login-accent {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ca-login-tagline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem; font-weight: 300; letter-spacing: 0.12em;
          color: #475569; margin-bottom: 2.4rem;
          animation: caLoginUp 0.8s 0.14s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-login-divider {
          height: 1px; background: rgba(56,189,248,0.1); margin-bottom: 2rem;
          animation: caLoginUp 0.8s 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-login-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: #475569; margin-bottom: 1.2rem;
          animation: caLoginUp 0.8s 0.22s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-github-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700;
          letter-spacing: 0.05em;
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 0.85rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
          margin-bottom: 2.2rem;
          animation: caLoginUp 0.8s 0.28s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-github-btn:hover {
          background: rgba(56,189,248,0.08);
          border-color: rgba(56,189,248,0.35);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(56,189,248,0.12);
        }
        .ca-github-btn:active { transform: translateY(0); }
        .ca-back-btn {
          display: block; width: 100%; text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem; letter-spacing: 0.1em;
          color: #334155;
          background: none; border: none; cursor: pointer;
          transition: color 0.18s;
          animation: caLoginUp 0.8s 0.34s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-back-btn:hover { color: #38bdf8; }
      `}</style>

      <div className="ca-login-root">
        <canvas ref={canvasRef} className="ca-login-canvas" />
        <div className="ca-login-grid" />
        <div className="ca-login-orb ca-login-orb1" />
        <div className="ca-login-orb ca-login-orb2" />

        <div className="ca-login-card">
          <div className="ca-login-logo">
            Code<span className="ca-login-accent">Atlas</span>
          </div>
          <div className="ca-login-tagline">// visual code intelligence</div>
          <div className="ca-login-divider" />
          <div className="ca-login-label">Continue with</div>

          <button className="ca-github-btn" onClick={handleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Sign in with GitHub
          </button>

          <button className="ca-back-btn" onClick={() => navigate("/")}>
            ← back to home
          </button>
        </div>
      </div>
    </>
  );
}