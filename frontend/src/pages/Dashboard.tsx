import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../styles/dashboard.css"
export default function Dashboard() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      const count = Math.floor((canvas.width * canvas.height) / 22000);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
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
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            const a = (1 - d / 120) * 0.3;
            ctx.strokeStyle = Math.random() > 0.85
              ? `rgba(99,102,241,${a})`
              : `rgba(56,189,248,${a * 0.7})`;
            ctx.lineWidth = 0.5;
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
        ctx.fillStyle = `rgba(56,189,248,${0.4 + 0.35 * p})`;
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

      <div className="ca-db-root">
        <canvas ref={canvasRef} className="ca-db-canvas" />
        <div className="ca-db-grid" />
        <div className="ca-db-orb ca-db-orb1" />
        <div className="ca-db-orb ca-db-orb2" />

        <div className="ca-db-page">
          <nav className="ca-db-nav">
            <div className="ca-db-logo">Code<span className="ca-db-accent">Atlas</span></div>
            <div className="ca-db-nav-right">
              <span className="ca-db-nav-tag">Dashboard</span>
              <button className="ca-db-logout" onClick={() => navigate("/")}>logout →</button>
            </div>
          </nav>

          <main className="ca-db-main">
            <div className="ca-db-welcome">
              <div className="ca-db-welcome-sub">// workspace</div>
              <h2>Ready to map <span>a codebase?</span></h2>
            </div>

            <div className="ca-db-cta">
              <div className="ca-db-cta-glow" />
              <div className="ca-db-cta-label">New Analysis</div>
              <h3>Analyze a Repository</h3>
              <p>Paste a GitHub URL and turn any repo into<br />an interactive dependency graph in seconds.</p>
              <button className="ca-db-analyze-btn" onClick={() => navigate("/analyze")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Analyze a Repository
              </button>
            </div>

            <div className="ca-db-grid-cards">
              <div className="ca-db-placeholder">
                <div className="ca-db-card-header">
                  <span className="ca-db-card-title">Recent Analyses</span>
                  <span className="ca-db-card-badge">coming soon</span>
                </div>
                <div className="ca-db-row w80" />
                <div className="ca-db-row w60" />
                <div className="ca-db-row w45" />
                <div className="ca-db-empty">// no analyses yet</div>
              </div>

              <div className="ca-db-placeholder">
                <div className="ca-db-card-header">
                  <span className="ca-db-card-title">Saved Graphs</span>
                  <span className="ca-db-card-badge">coming soon</span>
                </div>
                <div className="ca-db-row w60" />
                <div className="ca-db-row w80" />
                <div className="ca-db-row w45" />
                <div className="ca-db-empty">// no saved graphs yet</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}