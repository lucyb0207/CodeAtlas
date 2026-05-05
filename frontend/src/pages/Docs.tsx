import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/docs.css";
 
type Section = {
  id: string;
  label: string;
  items: { id: string; label: string }[];
};
 
const NAV: Section[] = [
  {
    id: "getting-started",
    label: "Getting started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "quick-start", label: "Quick start" },
      { id: "how-it-works", label: "How it works" },
    ],
  },
  {
    id: "core-concepts",
    label: "Core concepts",
    items: [
      { id: "dependency-graphs", label: "Dependency graphs" },
      { id: "focus-mode", label: "Focus mode" },
      { id: "graph-depth", label: "Graph depth" },
      { id: "file-inspector", label: "File inspector" },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    items: [
      { id: "analyzing-a-repo", label: "Analyzing a repo" },
      { id: "navigating-the-graph", label: "Navigating the graph" },
      { id: "using-focus-mode", label: "Using focus mode" },
      { id: "reading-imports", label: "Reading imports" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    items: [
      { id: "supported-languages", label: "Supported languages" },
      { id: "keyboard-shortcuts", label: "Keyboard shortcuts" },
      { id: "api", label: "API (coming soon)" },
    ],
  },
];
 
const PAGES: Record<string, React.ReactNode> = {
  "introduction": <IntroPage />,
  "quick-start": <QuickStartPage />,
  "how-it-works": <HowItWorksPage />,
  "dependency-graphs": <DependencyGraphsPage />,
  "focus-mode": <FocusModePage />,
  "graph-depth": <GraphDepthPage />,
  "file-inspector": <FileInspectorPage />,
  "keyboard-shortcuts": <KeyboardShortcutsPage />,
  "supported-languages": <SupportedLanguagesPage />,
};
 
function IC({ children }: { children: React.ReactNode }) {
  return <code className="ca-docs-ic">{children}</code>;
}
function Callout({ type = "info", label, children }: { type?: "info" | "warn"; label: string; children: React.ReactNode }) {
  return (
    <div className={`ca-docs-callout ca-docs-callout-${type}`}>
      <div className="ca-docs-callout-label">// {label}</div>
      <p>{children}</p>
    </div>
  );
}
function CodeBlock({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <div className="ca-docs-code-block">
      <div className="ca-docs-code-header">
        <span className="ca-docs-code-lang">{lang}</span>
        <span className="ca-docs-code-copy">Copy</span>
      </div>
      <div className="ca-docs-code-body">{children}</div>
    </div>
  );
}
function Steps({ items }: { items: { title: string; desc: React.ReactNode }[] }) {
  return (
    <div className="ca-docs-steps">
      {items.map(({ title, desc }, i) => (
        <div key={i} className="ca-docs-step">
          <div className="ca-docs-step-n">{String(i + 1).padStart(2, "0")}</div>
          <div>
            <div className="ca-docs-step-title">{title}</div>
            <div className="ca-docs-step-desc">{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
function DocTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <table className="ca-docs-table">
      <thead>
        <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
function Badge({ type }: { type: "yes" | "soon" }) {
  return <span className={`ca-docs-badge ca-docs-badge-${type}`}>{type === "yes" ? "Supported" : "Coming soon"}</span>;
}
function NavFooter({ prev, next }: { prev?: string; next?: string }) {
  return (
    <div className="ca-docs-nav-footer">
      <div className={`ca-docs-nav-btn${prev ? "" : " ca-docs-nav-btn-empty"}`}>
        {prev && <><span className="ca-docs-nav-dir">← Previous</span><span className="ca-docs-nav-page">{prev}</span></>}
      </div>
      <div className={`ca-docs-nav-btn ca-docs-nav-btn-next${next ? "" : " ca-docs-nav-btn-empty"}`}>
        {next && <><span className="ca-docs-nav-dir">Next →</span><span className="ca-docs-nav-page">{next}</span></>}
      </div>
    </div>
  );
}
function KbdRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <tr>
      <td><div style={{ display: "flex", gap: 4 }}>{keys.map((k) => <kbd key={k} className="ca-docs-kbd">{k}</kbd>)}</div></td>
      <td>{action}</td>
    </tr>
  );
}
 
function IntroPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// getting started</div>
    <h1 className="ca-docs-h1">Introduction to CodeAtlas</h1>
    <p className="ca-docs-lead">
      CodeAtlas turns any GitHub repository into an interactive dependency graph.
      Understand how files relate, trace imports instantly, and navigate complex
      codebases visually... in seconds, not days.
    </p>
    <h2 className="ca-docs-h2">What is CodeAtlas?</h2>
    <p className="ca-docs-p">
      CodeAtlas is a developer tool for visual codebase exploration. Paste a GitHub URL, and CodeAtlas
      parses every file, resolves every import, and renders the relationships as an interactive force-directed graph.
      Click any node to inspect its imports and dependents. Use focus mode to isolate a single file's neighborhood.
    </p>
    <Callout label="note">
      CodeAtlas currently supports public GitHub repositories. Private repo support and local file analysis are currently on the roadmap.
    </Callout>
    <h2 className="ca-docs-h2">Getting started</h2>
    <Steps items={[
      { title: "Open the app", desc: "Navigate to the Analyze page from the dashboard." },
      { title: "Paste a GitHub URL", desc: <span>Enter any public repo URL e.g. <IC>github.com/vercel/next.js</IC>. Hit Analyze.</span> },
      { title: "Explore the graph", desc: "Drag nodes, zoom, and click any file to open the File Inspector. Enable Focus Mode to isolate a subgraph." },
    ]} />
    <h2 className="ca-docs-h2">Supported languages</h2>
    <DocTable
      headers={["Language", "Import style", "Status"]}
      rows={[
        ["TypeScript / TSX", <span><IC>import</IC>, <IC>require()</IC></span>, <Badge type="yes" />],
        ["JavaScript / JSX", <span><IC>import</IC>, <IC>require()</IC></span>, <Badge type="yes" />],
        ["Python", <span><IC>import</IC>, <IC>from X import</IC></span>, <Badge type="yes" />],
        ["Go", <IC>import</IC>, <Badge type="soon" />],
        ["Rust", <span><IC>use</IC>, <IC>mod</IC></span>, <Badge type="soon" />],
      ]}
    />
    <Callout type="warn" label="warning">
      Dynamic imports (<IC>import()</IC> with variables) and circular dependencies are detected but may not resolve to a specific target node.
    </Callout>
    <NavFooter next="Quick start" />
  </>;
}
 
function QuickStartPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// getting started</div>
    <h1 className="ca-docs-h1">Quick start</h1>
    <p className="ca-docs-lead">Analyze your first repository in under 60 seconds.</p>
    <h2 className="ca-docs-h2">1. Open the Dashboard page</h2>
    <p className="ca-docs-p">From the dashboard, click <IC>Analyze a Repository</IC>. You'll land on the main graph view with an empty canvas.</p>
    <h2 className="ca-docs-h2">2. Enter a repo URL</h2>
    <p className="ca-docs-p">Paste any public GitHub repository into the input field at the top. You currently have to include the <IC>https://github.com/</IC> prefix.</p>
    <CodeBlock lang="URL">
      <span style={{ color: "#86efac" }}>https://github.com/facebook/react</span>
    </CodeBlock>
    <h2 className="ca-docs-h2">3. Click Analyze</h2>
    <p className="ca-docs-p">CodeAtlas clones the repo, parses imports across all supported files, and renders the dependency graph. Most repos complete in 5–15 seconds depending on size.</p>
    <h2 className="ca-docs-h2">4. Interact with the graph</h2>
    <p className="ca-docs-p">Once the graph loads:</p>
    <Steps items={[
      { title: "Click a node", desc: "Opens the File Inspector sidebar showing imports and dependents." },
      { title: "Drag nodes", desc: "Rearrange the layout to your preference: positions are not saved." },
      { title: "Scroll to zoom", desc: "Zoom in and out with your scroll wheel or trackpad." },
      { title: "Toggle Focus Mode", desc: <span>Enable the <IC>Focus ON</IC> button to show only the selected file's subgraph.</span> },
    ]} />
    <NavFooter prev="Introduction" next="How it works" />
  </>;
}
 
function HowItWorksPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// getting started</div>
    <h1 className="ca-docs-h1">How it works</h1>
    <p className="ca-docs-lead">A look under the hood at how CodeAtlas parses and visualizes codebases.</p>
    <h2 className="ca-docs-h2">Pipeline overview</h2>
    <Steps items={[
      { title: "Clone", desc: "The backend clones the repository to a temporary workspace using a shallow clone for speed." },
      { title: "Walk", desc: "Every file matching a supported extension is discovered recursively, ignoring node_modules, dist, and other common output directories." },
      { title: "Parse", desc: "Each file is statically analyzed. Import and require statements are extracted and resolved to relative file paths where possible." },
      { title: "Graph", desc: <span>Nodes represent files. Directed edges represent import relationships (<IC>source → target</IC>). Back-links (dependents) are computed from the edge list.</span> },
      { title: "Render", desc: "The graph is serialized as JSON and sent to the frontend, where D3 force simulation positions and renders the nodes interactively." },
    ]} />
    <h2 className="ca-docs-h2">Graph data structure</h2>
    <p className="ca-docs-p">The API returns the following shape:</p>
    <CodeBlock lang="TypeScript">
      <span className="ca-kw">type</span> <span className="ca-fn">GraphData</span> = {"{"}<br />
      &nbsp;&nbsp;nodes: {"{"} id: <span className="ca-kw">string</span> {"}"}[]<br />
      &nbsp;&nbsp;links: {"{"}<br />
      &nbsp;&nbsp;&nbsp;&nbsp;source: <span className="ca-kw">string</span><br />
      &nbsp;&nbsp;&nbsp;&nbsp;target: <span className="ca-kw">string</span><br />
      &nbsp;&nbsp;{"}"}[]<br />
      &nbsp;&nbsp;backLinks: <span className="ca-fn">Record</span>{"<"}<span className="ca-kw">string</span>, <span className="ca-kw">string</span>[]{">"}<br />
      {"}"}
    </CodeBlock>
    <Callout label="note">
      Node IDs are relative file paths from the repo root, e.g. <IC>src/components/Nav.tsx</IC>. This makes them human-readable and unique within a repo.
    </Callout>
    <NavFooter prev="Quick start" next="Dependency graphs" />
  </>;
}
 
function DependencyGraphsPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// core concepts</div>
    <h1 className="ca-docs-h1">Dependency graphs</h1>
    <p className="ca-docs-lead">Understanding the visual model that CodeAtlas uses to represent codebases.</p>
    <h2 className="ca-docs-h2">Nodes and edges</h2>
    <p className="ca-docs-p">Every file in the repository is a <strong style={{ color: "#e2e8f0", fontWeight: 700 }}>node</strong>. Every <IC>import</IC> or <IC>require()</IC> statement that resolves to another file in the repo creates a directed <strong style={{ color: "#e2e8f0", fontWeight: 700 }}>edge</strong> from the importing file to the imported file.</p>
    <h2 className="ca-docs-h2">Node colors</h2>
    <DocTable
      headers={["Color", "Meaning"]}
      rows={[
        [<span style={{ color: "#38bdf8" }}>● Cyan</span>, "Default: any file not matching a special folder"],
        [<span style={{ color: "#818cf8" }}>● Indigo</span>, "Files in components/ directories"],
        [<span style={{ color: "#34d399" }}>● Emerald</span>, "Files in pages/ directories"],
        [<span style={{ color: "#fbbf24" }}>● Amber</span>, "Files in utils/ directories"],
        [<span style={{ color: "#f87171" }}>● Red</span>, "Files in server/ directories"],
      ]}
    />
    <h2 className="ca-docs-h2">Edge colors</h2>
    <DocTable
      headers={["Color", "Meaning"]}
      rows={[
        [<span style={{ color: "#38bdf8" }}>— Cyan</span>, "Selected file imports this target"],
        [<span style={{ color: "#818cf8" }}>— Indigo</span>, "Selected file is imported by this source"],
        [<span style={{ color: "#334155" }}>— Gray</span>, "Unrelated edge (dimmed)"],
      ]}
    />
    <NavFooter prev="How it works" next="Focus mode" />
  </>;
}
 
function FocusModePage() {
  return <>
    <div className="ca-docs-page-eyebrow">// core concepts</div>
    <h1 className="ca-docs-h1">Focus mode</h1>
    <p className="ca-docs-lead">Isolate a single file and its neighborhood to cut through graph complexity.</p>
    <h2 className="ca-docs-h2">What it does</h2>
    <p className="ca-docs-p">When Focus Mode is enabled and a file is selected, the graph filters to show only the selected file and files reachable within the configured graph depth. All other nodes and edges are hidden — not just dimmed.</p>
    <h2 className="ca-docs-h2">Enabling focus mode</h2>
    <p className="ca-docs-p">Click the <IC>Focus ON</IC> toggle in the top navigation bar. Click again to disable and return to the full graph.</p>
    <Callout label="tip">
      Focus mode is most useful when combined with a low graph depth (1–2) to see only the immediate neighbors of a file.
    </Callout>
    <h2 className="ca-docs-h2">Behavior when no file is selected</h2>
    <p className="ca-docs-p">If Focus Mode is on but no file is selected (no node clicked), the full graph is shown. Selecting a node immediately applies the focus filter.</p>
    <NavFooter prev="Dependency graphs" next="Graph depth" />
  </>;
}
 
function GraphDepthPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// core concepts</div>
    <h1 className="ca-docs-h1">Graph depth</h1>
    <p className="ca-docs-lead">Control how many hops away from the selected file are shown in Focus Mode.</p>
    <h2 className="ca-docs-h2">The depth slider</h2>
    <p className="ca-docs-p">The Depth slider in the header controls the number of hops traversed from the selected node in both directions (imports and dependents). Range is 1–5.</p>
    <DocTable
      headers={["Depth", "Behavior"]}
      rows={[
        ["1", "Direct imports and dependents only"],
        ["2", "Imports of imports; dependents of dependents"],
        ["3–5", "Progressively wider subgraph; can get large quickly on busy files"],
      ]}
    />
    <Callout type="warn" label="performance">
      On large repositories (1000+ nodes), setting depth to 4 or 5 may render hundreds of nodes and slow down the simulation. Start at depth 2 and increase as needed.
    </Callout>
    <NavFooter prev="Focus mode" next="File inspector" />
  </>;
}
 
function FileInspectorPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// core concepts</div>
    <h1 className="ca-docs-h1">File inspector</h1>
    <p className="ca-docs-lead">The sidebar panel that shows detailed information about the selected file.</p>
    <h2 className="ca-docs-h2">Opening the inspector</h2>
    <p className="ca-docs-p">Click any node in the graph to select it. The File Inspector opens automatically in the right sidebar.</p>
    <h2 className="ca-docs-h2">Inspector sections</h2>
    <DocTable
      headers={["Section", "Contents"]}
      rows={[
        [<IC>FILE</IC>, "The relative path of the selected file from the repo root"],
        [<IC>IMPORTS</IC>, "All files this file imports (outgoing edges → cyan arrows)"],
        [<IC>DEPENDENTS</IC>, "All files that import this file (incoming edges ← indigo arrows)"],
      ]}
    />
    <h2 className="ca-docs-h2">Code preview</h2>
    <p className="ca-docs-p">When a file is selected, its source code is fetched and displayed in the Monaco editor panel at the bottom of the screen. The editor is read-only and syntax-highlighted based on file extension.</p>
    <NavFooter prev="Graph depth" next="Analyzing a repo" />
  </>;
}
 
function SupportedLanguagesPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// reference</div>
    <h1 className="ca-docs-h1">Supported languages</h1>
    <p className="ca-docs-lead">Languages and import styles that CodeAtlas can parse and resolve.</p>
    <DocTable
      headers={["Language", "Extensions", "Import style", "Status"]}
      rows={[
        ["TypeScript", <IC>.ts .tsx</IC>, <span><IC>import</IC>, <IC>require()</IC></span>, <Badge type="yes" />],
        ["JavaScript", <IC>.js .jsx .mjs</IC>, <span><IC>import</IC>, <IC>require()</IC></span>, <Badge type="yes" />],
        ["Python", <IC>.py</IC>, <span><IC>import X</IC>, <IC>from X import</IC></span>, <Badge type="yes" />],
        ["Go", <IC>.go</IC>, <IC>import</IC>, <Badge type="soon" />],
        ["Rust", <IC>.rs</IC>, <span><IC>use</IC>, <IC>mod</IC></span>, <Badge type="soon" />],
        ["Java", <IC>.java</IC>, <IC>import</IC>, <Badge type="soon" />],
      ]}
    />
    <Callout label="note">
      Only intra-repository imports are resolved. Third-party packages (node_modules, PyPI, etc.) appear as unresolved edges and are excluded from the graph.
    </Callout>
    <NavFooter prev="Graph depth" next="Keyboard shortcuts" />
  </>;
}
 
function KeyboardShortcutsPage() {
  return <>
    <div className="ca-docs-page-eyebrow">// reference</div>
    <h1 className="ca-docs-h1">Keyboard shortcuts</h1>
    <p className="ca-docs-lead">Speed up graph navigation with these shortcuts.</p>
    <h2 className="ca-docs-h2">Graph</h2>
    <table className="ca-docs-table">
      <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
      <tbody>
        <KbdRow keys={["Scroll"]} action="Zoom in / out" />
        <KbdRow keys={["Click", "drag"]} action="Pan the graph" />
        <KbdRow keys={["Click node"]} action="Select file and open inspector" />
        <KbdRow keys={["Drag node"]} action="Reposition a node" />
      </tbody>
    </table>
    <h2 className="ca-docs-h2">Controls</h2>
    <table className="ca-docs-table">
      <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
      <tbody>
        <KbdRow keys={["F"]} action="Toggle Focus Mode on / off" />
        <KbdRow keys={["["]} action="Decrease graph depth by 1" />
        <KbdRow keys={["]"]} action="Increase graph depth by 1" />
        <KbdRow keys={["Esc"]} action="Deselect node and close inspector" />
      </tbody>
    </table>
    <Callout label="note">Keyboard shortcuts are active when the graph canvas is focused. Click the graph area first if shortcuts are not responding.</Callout>
    <NavFooter prev="Supported languages" />
  </>;
}
 
export default function Docs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("introduction");
 
  const allItems = NAV.flatMap((s) => s.items);
  const currentIdx = allItems.findIndex((i) => i.id === active);
  const section = NAV.find((s) => s.items.some((i) => i.id === active));
 
  const toc: Record<string, { label: string; sub?: string[] }[]> = {
    introduction: [
      { label: "What is CodeAtlas?" },
      { label: "Getting started", sub: ["Open the app", "Paste a URL", "Explore"] },
      { label: "Supported languages" },
    ],
    "quick-start": [
      { label: "Open Analyze page" },
      { label: "Enter a repo URL" },
      { label: "Click Analyze" },
      { label: "Interact with graph" },
    ],
    "how-it-works": [
      { label: "Pipeline overview" },
      { label: "Graph data structure" },
    ],
    "dependency-graphs": [
      { label: "Nodes and edges" },
      { label: "Node colors" },
      { label: "Edge colors" },
    ],
    "focus-mode": [
      { label: "What it does" },
      { label: "Enabling focus mode" },
      { label: "No file selected" },
    ],
    "graph-depth": [
      { label: "The depth slider" },
    ],
    "file-inspector": [
      { label: "Opening the inspector" },
      { label: "Inspector sections" },
      { label: "Code preview" },
    ],
    "supported-languages": [
      { label: "Language table" },
    ],
    "keyboard-shortcuts": [
      { label: "Graph" },
      { label: "Controls" },
    ],
  };
 
  const currentToc = toc[active] || [];
  const content = PAGES[active];
 
  return (
    <>
 
      <div className="ca-docs-root">
 
        {/* NAV */}
        <nav className="ca-docs-nav">
          <div className="ca-docs-nav-left">
            <div className="ca-docs-logo" onClick={() => navigate("/")}>
              Code<span className="ca-docs-logo-accent">Atlas</span>
            </div>
            <div className="ca-docs-nav-divider" />
            <span className="ca-docs-nav-tag">Documentation</span>
          </div>
          <div className="ca-docs-nav-right">
            <span className="ca-docs-nav-link">GitHub</span>
            <span className="ca-docs-nav-link">Changelog</span>
            <button className="ca-docs-nav-cta" onClick={() => navigate("/dashboard")}>Open App</button>
          </div>
        </nav>
 
        {/* LAYOUT */}
        <div className="ca-docs-layout">
 
          {/* SIDEBAR */}
          <div className="ca-docs-sidebar">
            {NAV.map((sec) => (
              <div key={sec.id} className="ca-docs-sidebar-section">
                <div className="ca-docs-sidebar-label">{sec.label}</div>
                {sec.items.map((item) => (
                  <div
                    key={item.id}
                    className={`ca-docs-sidebar-item${active === item.id ? " active" : ""}`}
                    onClick={() => setActive(item.id)}
                  >
                    <div className="ca-docs-sidebar-dot" />
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
 
          {/* CONTENT */}
          <div className="ca-docs-content">
            <div className="ca-docs-content-inner">
              <div className="ca-docs-breadcrumb">
                <span>Docs</span>
                <span className="ca-docs-breadcrumb-sep">/</span>
                <span>{section?.label}</span>
                <span className="ca-docs-breadcrumb-sep">/</span>
                <span className="ca-docs-breadcrumb-cur">
                  {allItems[currentIdx]?.label}
                </span>
              </div>
              {content ?? (
                <>
                  <div className="ca-docs-page-eyebrow">// coming soon</div>
                  <h1 className="ca-docs-h1">{allItems[currentIdx]?.label}</h1>
                  <p className="ca-docs-lead">This page is under construction.</p>
                </>
              )}
            </div>
          </div>
 
          {/* TOC */}
          <div className="ca-docs-toc">
            <div className="ca-docs-toc-label">On this page</div>
            {currentToc.map(({ label, sub }) => (
              <div key={label}>
                <div className="ca-docs-toc-item">{label}</div>
                {sub?.map((s) => (
                  <div key={s} className={`ca-docs-toc-item ca-docs-toc-sub`}>{s}</div>
                ))}
              </div>
            ))}
          </div>
 
        </div>
      </div>
    </>
  );
}
 