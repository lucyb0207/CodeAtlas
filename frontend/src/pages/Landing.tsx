import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Landing() {
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
        const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.85 + 0.15 * pulse), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${0.5 + 0.4 * pulse})`;
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

        .ca-root {
          background: #050810;
          color: #e8eaf0;
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .ca-canvas { position: fixed; inset: 0; z-index: 0; opacity: 0.55; }
        .ca-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .ca-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .ca-orb1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);
          top: -100px; right: -80px;
        }
        .ca-orb2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          bottom: -80px; left: -60px;
        }
        .ca-container {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 2rem; max-width: 680px;
          animation: caFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes caFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ca-eyebrow {
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
          font-weight: 300; letter-spacing: 0.22em; text-transform: uppercase;
          color: #38bdf8; border: 1px solid rgba(56,189,248,0.25);
          padding: 0.35rem 1rem; border-radius: 999px; margin-bottom: 2.2rem;
          background: rgba(56,189,248,0.06);
          animation: caFadeUp 0.9s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-h1 {
          font-size: clamp(3.8rem, 10vw, 6rem); font-weight: 800;
          line-height: 0.95; letter-spacing: -0.03em; margin-bottom: 1.6rem;
          animation: caFadeUp 0.9s 0.18s cubic-bezier(0.16,1,0.3,1) both;
          background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ca-accent {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ca-p {
          font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 300;
          line-height: 1.75; color: #94a3b8; max-width: 440px; margin-bottom: 3rem;
          animation: caFadeUp 0.9s 0.26s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-btn-group {
          display: flex; flex-direction: column; align-items: center; gap: 0.9rem;
          animation: caFadeUp 0.9s 0.34s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ca-btn {
          position: relative; font-family: 'Syne', sans-serif; font-size: 0.9rem;
          font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          color: #fff; border: none; padding: 0.85rem 2.6rem; border-radius: 4px;
          cursor: pointer; overflow: hidden;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 0 0 1px rgba(56,189,248,0.3), 0 8px 32px rgba(56,189,248,0.18);
        }
        .ca-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px rgba(56,189,248,0.5), 0 16px 48px rgba(56,189,248,0.28);
        }
        .ca-btn:active { transform: translateY(0); }
        .ca-sub {
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
          color: #475569; letter-spacing: 0.1em;
        }
      `}</style>

      <div className="ca-root">
        <canvas ref={canvasRef} className="ca-canvas" />
        <div className="ca-grid" />
        <div className="ca-orb ca-orb1" />
        <div className="ca-orb ca-orb2" />

        <div className="ca-container">
          <div className="ca-eyebrow">Visual Code Intelligence</div>
          <h1 className="ca-h1">Code<span className="ca-accent">Atlas</span></h1>
          <p className="ca-p">
            Understand any codebase visually.<br />
            Turn repositories into interactive dependency graphs.
          </p>
          <div className="ca-btn-group">
            <button className="ca-btn" onClick={() => navigate("/login")}>
              Get Started
            </button>
            <span className="ca-sub">No setup required</span>
          </div>
        </div>
      </div>
    </>
  );
}