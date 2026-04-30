import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "../styles/landing.css";

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