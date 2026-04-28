import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:wght@300;400&display=swap');

        .ca-db-root { background:#050810; color:#e8eaf0; font-family:'Syne',sans-serif; min-height:100vh; overflow-x:hidden; position:relative; }
        .ca-db-canvas { position:fixed; inset:0; z-index:0; opacity:0.3; pointer-events:none; }
        .ca-db-grid {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image: linear-gradient(rgba(56,189,248,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(56,189,248,0.03) 1px,transparent 1px);
          background-size:60px 60px;
        }
        .ca-db-orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
        .ca-db-orb1 { width:340px; height:340px; background:radial-gradient(circle,rgba(56,189,248,0.08) 0%,transparent 70%); top:-80px; right:0; }
        .ca-db-orb2 { width:220px; height:220px; background:radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%); bottom:20%; left:-60px; }

        .ca-db-page { position:relative; z-index:10; min-height:100vh; display:flex; flex-direction:column; }

        .ca-db-nav {
          display:flex; align-items:center; justify-content:space-between;
          padding:1.4rem 2.4rem;
          border-bottom:1px solid rgba(56,189,248,0.08);
          background:rgba(5,8,16,0.7); backdrop-filter:blur(12px);
          position:sticky; top:0; z-index:20;
          animation:caDbFadeDown 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes caDbFadeDown { from{opacity:0;transform:translateY(-12px);} to{opacity:1;transform:translateY(0);} }
        .ca-db-logo { font-size:1.25rem; font-weight:800; letter-spacing:-0.02em; }
        .ca-db-accent { background:linear-gradient(90deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ca-db-nav-right { display:flex; align-items:center; gap:1.6rem; }
        .ca-db-nav-tag {
          font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.18em; text-transform:uppercase;
          color:#38bdf8; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.2);
          padding:0.25rem 0.7rem; border-radius:999px;
        }
        .ca-db-logout {
          font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.1em;
          color:#334155; background:none; border:none; cursor:pointer; transition:color 0.18s;
        }
        .ca-db-logout:hover { color:#38bdf8; }

        .ca-db-main { padding:2.8rem 2.4rem; max-width:960px; width:100%; margin:0 auto; flex:1; }

        .ca-db-welcome { margin-bottom:2.8rem; animation:caDbFadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes caDbFadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .ca-db-welcome-sub { font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.18em; text-transform:uppercase; color:#38bdf8; margin-bottom:0.6rem; }
        .ca-db-welcome h2 { font-size:1.9rem; font-weight:800; letter-spacing:-0.02em; color:#e2e8f0; }
        .ca-db-welcome h2 span { color:#475569; }

        .ca-db-cta {
          position:relative; overflow:hidden;
          background:rgba(8,14,28,0.9); border:1px solid rgba(56,189,248,0.18);
          border-radius:8px; padding:2.4rem; margin-bottom:2rem;
          animation:caDbFadeUp 0.7s 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-db-cta::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(56,189,248,0.04) 0%,transparent 60%);
          pointer-events:none;
        }
        .ca-db-cta-glow {
          position:absolute; top:-60px; right:-60px; width:200px; height:200px;
          border-radius:50%; background:radial-gradient(circle,rgba(56,189,248,0.12) 0%,transparent 70%);
          filter:blur(30px); pointer-events:none;
        }
        .ca-db-cta-label { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; color:#475569; margin-bottom:0.7rem; }
        .ca-db-cta h3 { font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; color:#e2e8f0; }
        .ca-db-cta p { font-family:'JetBrains Mono',monospace; font-size:0.78rem; color:#475569; line-height:1.7; margin-bottom:1.8rem; }

        .ca-db-analyze-btn {
          display:inline-flex; align-items:center; gap:0.6rem;
          font-family:'Syne',sans-serif; font-size:0.88rem; font-weight:700; letter-spacing:0.05em;
          background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; border:none;
          padding:0.8rem 2rem; border-radius:4px; cursor:pointer;
          transition:transform 0.18s,box-shadow 0.18s;
          box-shadow:0 0 0 1px rgba(56,189,248,0.3),0 8px 28px rgba(56,189,248,0.18);
        }
        .ca-db-analyze-btn:hover { transform:translateY(-2px); box-shadow:0 0 0 1px rgba(56,189,248,0.5),0 14px 40px rgba(56,189,248,0.28); }
        .ca-db-analyze-btn:active { transform:translateY(0); }

        .ca-db-grid-cards { display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; }

        .ca-db-placeholder {
          background:rgba(8,14,28,0.7); border:1px solid rgba(56,189,248,0.07);
          border-radius:8px; padding:1.8rem;
          animation:caDbFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-db-placeholder:nth-child(1) { animation-delay:0.26s; }
        .ca-db-placeholder:nth-child(2) { animation-delay:0.32s; }

        .ca-db-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.4rem; }
        .ca-db-card-title { font-size:0.88rem; font-weight:700; color:#94a3b8; }
        .ca-db-card-badge {
          font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.15em; text-transform:uppercase;
          color:#334155; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
          padding:0.2rem 0.55rem; border-radius:999px;
        }
        .ca-db-row {
          height:10px; border-radius:3px; margin-bottom:0.7rem;
          background:rgba(255,255,255,0.04);
          animation:caDbShimmer 2.2s ease-in-out infinite;
        }
        .ca-db-row.w80 { width:80%; } .ca-db-row.w60 { width:60%; } .ca-db-row.w45 { width:45%; }
        @keyframes caDbShimmer { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
        .ca-db-empty { font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.1em; color:#1e293b; margin-top:1rem; }
      `}</style>

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