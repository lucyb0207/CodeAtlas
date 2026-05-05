
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../styles/landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
 
  // ── Canvas graph animation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    type N = { x: number; y: number; vx: number; vy: number; r: number; pulse: number };
    let nodes: N[] = [];
 
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };
    const initNodes = () => {
      const count = Math.floor((canvas.width * canvas.height) / 16000);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.7,
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.011;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      const maxD = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            const a = (1 - d / maxD) * 0.3;
            ctx.strokeStyle = Math.random() > 0.85 ? `rgba(99,102,241,${a})` : `rgba(56,189,248,${a * 0.65})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        const p = 0.5 + 0.5 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (0.85 + 0.15 * p), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${0.45 + 0.4 * p})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
 
  // ── Scroll-based reveals ────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible((prev) => new Set([...prev, e.target.id]));
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
 
  const rv = (id: string) => ({
    id,
    "data-reveal": true,
    style: {
      opacity: visible.has(id) ? 1 : 0,
      transform: visible.has(id) ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)",
    } as React.CSSProperties,
  });
 
  return (
    <>
      <div className="ca-root">
        <canvas ref={canvasRef} className="ca-canvas" />
        <div className="ca-grid" />
        <div className="ca-orb ca-orb1" />
        <div className="ca-orb ca-orb2" />
        <div className="ca-orb ca-orb3" />
 
        {/* ── NAV ── */}
        <nav className="ca-nav">
          <div className="ca-nav-logo">Code<span className="ca-nav-accent">Atlas</span></div>
          <div className="ca-nav-links">
            <span className="ca-nav-link">Features</span>
            <span className="ca-nav-link">How it works</span>
            <span className="ca-nav-link"><a href="/docs">Docs</a></span>
          </div>
          <button className="ca-nav-cta" onClick={() => navigate("/login")}>Get Started</button>
        </nav>
 
        {/* ── HERO ── */}
        <section className="ca-hero ca-section">
          <div className="ca-hero-eyebrow">Visual Code Intelligence</div>
          <h1 className="ca-hero-h1">
            Understand any<br /><em>codebase visually</em>
          </h1>
          <p className="ca-hero-sub">
            Paste a GitHub URL. In seconds, CodeAtlas maps every file,<br />
            import, and dependency into an interactive graph you can explore.
          </p>
          <div className="ca-hero-ctas">
            <button className="ca-btn" onClick={() => navigate("/login")}>Get Started</button>
          </div>
          <p className="ca-hero-trust">// No setup required · Works instantly</p>
          <div className="ca-hero-scroll">
            <div className="ca-scroll-line" />
          </div>
        </section>
 
        {/* ── SOCIAL PROOF ── */}
        <section className="ca-proof ca-section">
          <div className="ca-container">
            <div className="ca-proof-inner">
              <span className="ca-proof-label">Trusted by developers using</span>
              <div className="ca-proof-divider" />
              <div className="ca-proof-logos">
                {["GitHub", "Open Source", "TypeScript", "Node.js", "React"].map((l) => (
                  <span key={l} className="ca-proof-logo">{l}</span>
                ))}
              </div>
              <div className="ca-proof-divider" />
              <div style={{ display: "flex", gap: "2.4rem" }}>
                {[["1.2k+", "Repos analyzed"], ["40k+", "Files mapped"]].map(([n, d]) => (
                  <div key={d} className="ca-proof-stat">
                    <span className="ca-proof-num">{n}</span>
                    <span className="ca-proof-desc">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
 
        {/* ── FEATURES ── */}
        <section className="ca-features ca-section">
          <div className="ca-container">
            <div {...rv("feat-header")} className="ca-features-header">
              <div className="ca-section-eyebrow">// capabilities</div>
              <h2 className="ca-section-h2">Everything you need to<br />navigate complex code</h2>
              <p className="ca-section-sub">Built for the moments when a codebase feels overwhelming and you just need to see the map.</p>
            </div>
            <div className="ca-features-grid">
              {[
                {
                  id: "f1", delay: "ca-d1",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><line x1="6" y1="6" x2="10" y2="11"/><line x1="18" y1="6" x2="14" y2="11"/><line x1="6" y1="18" x2="10" y2="13"/><line x1="18" y1="18" x2="14" y2="13"/></svg>,
                  title: "Interactive Dependency Graph",
                  desc: "Drag, zoom, and explore every file relationship. Click any node to inspect imports and dependents in real time.",
                },
                {
                  id: "f2", delay: "ca-d2",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
                  title: "Instant Repo Analysis",
                  desc: "Paste any public GitHub URL. CodeAtlas clones, parses, and visualizes the entire repository in seconds.",
                },
                {
                  id: "f3", delay: "ca-d3",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
                  title: "File Relationships",
                  desc: "See exactly which files import what. Trace dependencies forward and backward across the entire codebase.",
                },
                {
                  id: "f4", delay: "ca-d4",
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
                  title: "Focus Mode",
                  desc: "Isolate any file and control graph depth from 1 to 5 hops. Cut through noise and see only what matters.",
                },
              ].map(({ id, delay, icon, title, desc }) => (
                <div key={id} {...rv(id)} className={`ca-feature-card ${delay}`}>
                  <div className="ca-feature-icon">{icon}</div>
                  <div className="ca-feature-title">{title}</div>
                  <div className="ca-feature-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* ── HOW IT WORKS ── */}
        <section className="ca-how ca-section">
          <div className="ca-container">
            <div {...rv("how-header")}>
              <div className="ca-section-eyebrow">// how it works</div>
              <h2 className="ca-section-h2">Three steps.<br />Zero friction.</h2>
            </div>
            <div {...rv("how-steps")} className="ca-how-steps">
              {[
                { n: "01", title: "Paste a GitHub URL", desc: "Any public repository. No installation, no tokens, no config." },
                { n: "02", title: "Analyze instantly", desc: "We parse every file, resolve imports, and build the graph in seconds." },
                { n: "03", title: "Explore visually", desc: "Click, zoom, and filter. Understand a new codebase in minutes, not days." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="ca-step">
                  <div className="ca-step-num">{n}</div>
                  <div className="ca-step-title">{title}</div>
                  <div className="ca-step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* ── PRODUCT PREVIEW ── */}
        <section className="ca-preview ca-section">
          <div className="ca-container">
            <div {...rv("prev-header")} style={{ marginBottom: 0 }}>
              <div className="ca-section-eyebrow">// product preview</div>
              <h2 className="ca-section-h2">See the graph. Know the code.</h2>
            </div>
            <div {...rv("prev-wrap")} className="ca-preview-wrap ca-d1">
              <div className="ca-preview-bar">
                <div className="ca-preview-dot ca-preview-dot-r" />
                <div className="ca-preview-dot ca-preview-dot-y" />
                <div className="ca-preview-dot ca-preview-dot-g" />
                <span className="ca-preview-title">codeatlas — vercel/next.js</span>
              </div>
              <div className="ca-preview-body">
                {/* Mock graph */}
                <div className="ca-preview-graph">
                  <svg className="ca-preview-svg" viewBox="0 0 680 380" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <marker id="pa" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                        <path d="M0,0 L5,2.5 L0,5 Z" fill="rgba(56,189,248,0.35)" />
                      </marker>
                    </defs>
                    {/* edges */}
                    <line x1="340" y1="190" x2="180" y2="100" stroke="rgba(56,189,248,0.22)" strokeWidth="1.2" markerEnd="url(#pa)"/>
                    <line x1="340" y1="190" x2="500" y2="110" stroke="rgba(56,189,248,0.22)" strokeWidth="1.2" markerEnd="url(#pa)"/>
                    <line x1="340" y1="190" x2="160" y2="290" stroke="rgba(56,189,248,0.22)" strokeWidth="1.2" markerEnd="url(#pa)"/>
                    <line x1="340" y1="190" x2="530" y2="280" stroke="rgba(56,189,248,0.22)" strokeWidth="1.2" markerEnd="url(#pa)"/>
                    <line x1="340" y1="190" x2="340" y2="320" stroke="rgba(129,140,248,0.25)" strokeWidth="1.2" markerEnd="url(#pa)"/>
                    <line x1="180" y1="100" x2="80" y2="50" stroke="rgba(56,189,248,0.1)" strokeWidth="0.8"/>
                    <line x1="500" y1="110" x2="610" y2="55" stroke="rgba(56,189,248,0.1)" strokeWidth="0.8"/>
                    <line x1="160" y1="290" x2="60" y2="355" stroke="rgba(56,189,248,0.1)" strokeWidth="0.8"/>
                    <line x1="530" y1="280" x2="635" y2="345" stroke="rgba(56,189,248,0.1)" strokeWidth="0.8"/>
                    {/* selected halo */}
                    <circle cx="340" cy="190" r="24" fill="rgba(56,189,248,0.05)" stroke="rgba(56,189,248,0.28)" strokeWidth="1.5"/>
                    {/* center */}
                    <circle cx="340" cy="190" r="10" fill="#38bdf8"/>
                    <text x="340" y="215" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill="rgba(56,189,248,0.65)">pages/index.tsx</text>
                    {/* neighbors */}
                    {[
                      { cx: 180, cy: 100, label: "components/Nav" },
                      { cx: 500, cy: 110, label: "hooks/useAuth" },
                      { cx: 160, cy: 290, label: "lib/api" },
                      { cx: 530, cy: 280, label: "utils/format" },
                    ].map(({ cx, cy, label }) => (
                      <g key={label}>
                        <circle cx={cx} cy={cy} r="7" fill="rgba(56,189,248,0.45)"/>
                        <text x={cx} y={cy - 13} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#334155">{label}</text>
                      </g>
                    ))}
                    <circle cx="340" cy="320" r="7" fill="rgba(129,140,248,0.55)"/>
                    <text x="340" y="338" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="7" fill="#334155">types/index</text>
                    {/* distant */}
                    {[{ cx:80,cy:50 },{ cx:610,cy:55 },{ cx:60,cy:355 },{ cx:635,cy:345 }].map(({ cx, cy }) => (
                      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="rgba(56,189,248,0.18)"/>
                    ))}
                  </svg>
                </div>
                {/* Sidebar */}
                <div className="ca-preview-sidebar">
                  <div className="ca-preview-slabel">File</div>
                  <div className="ca-preview-sfile">pages/index.tsx</div>
                  <div className="ca-preview-slabel">Imports</div>
                  {["components/Nav", "hooks/useAuth", "lib/api", "utils/format", "types/index"].map((f) => (
                    <div key={f} className="ca-preview-sitem"><span className="ca-preview-sarrow">→</span>{f}</div>
                  ))}
                  <div className="ca-preview-slabel">Dependents</div>
                  {["pages/_app.tsx", "pages/dashboard.tsx"].map((f) => (
                    <div key={f} className="ca-preview-sitem"><span className="ca-preview-sarrow-b">←</span>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
 
        {/* ── VALUE PROP ── */}
        <section className="ca-value ca-section">
          <div className="ca-container">
            <div {...rv("val-header")} className="ca-value-inner">
              <div className="ca-section-eyebrow">// why it matters</div>
              <h2 className="ca-value-h2">Stop spending days<br />reading code. <em>Start seeing it.</em></h2>
            </div>
            <div className="ca-value-points">
              {[
                { id: "v1", delay: "ca-d5", n: "01", title: "Save hours of onboarding", desc: "New to a codebase? The graph shows you the architecture in 30 seconds. No more hunting through files." },
                { id: "v2", delay: "ca-d6", n: "02", title: "Reduce cognitive load", desc: "Visual graphs are easier to reason about than scrolling through hundreds of imports and file paths." },
                { id: "v3", delay: "ca-d7", n: "03", title: "Understand at any scale", desc: "Works on 50-file side projects and 5,000-file monorepos equally well. Complexity is the problem. CodeAtlas is the solution." },
              ].map(({ id, delay, n, title, desc }) => (
                <div key={id} {...rv(id)} className={`ca-value-point ${delay}`}>
                  <div className="ca-value-point-num">// {n}</div>
                  <div className="ca-value-point-title">{title}</div>
                  <div className="ca-value-point-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
 
        {/* ── FINAL CTA ── */}
        <section className="ca-final ca-section">
          <div className="ca-container-sm">
            <div {...rv("final-cta")}>
              <h2 className="ca-final-h2">Ready to map<br />your codebase?</h2>
              <p className="ca-final-sub">
                Paste a GitHub URL and explore your first graph in under 60 seconds.<br />
                No account required. No credit card. Just understanding.
              </p>
              <button className="ca-btn" onClick={() => navigate("/login")}>
                Start Exploring
              </button>
              <p className="ca-final-trust">// Free · No setup · Works on any public repo</p>
            </div>
          </div>
        </section>
 
        {/* ── FOOTER ── */}
        <footer className="ca-footer">
          <div className="ca-footer-logo">Code<span className="ca-nav-accent">Atlas</span></div>
          <div className="ca-footer-links">
            {["GitHub", "Docs", "Privacy", "Contact"].map((l) => (
              <span key={l} className="ca-footer-link">{l}</span>
            ))}
          </div>
          <span className="ca-footer-copy">© {new Date().getFullYear()} CodeAtlas</span>
        </footer>
      </div>
    </>
  );
}