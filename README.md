![Developer Banner](https://ishan-rest.vercel.app/svg/banner/dev5/CodeAtlas)

# CodeAtlas

## Turn any GitHub repository into an interactive dependency graph

CodeAtlas is a full-stack developer tool that transforms GitHub repositories into **interactive dependency graphs**, enabling visual exploration of code structure, module relationships, and architectural flow.

It helps developers understand unfamiliar codebases faster by turning static files into an explorable system map.

---

## Preview

<img width="1512" height="861" alt="Screenshot 2026-04-21 at 20 29 31" src="https://github.com/user-attachments/assets/8309c60d-53a4-49c2-8f0a-b1a107040ca5" />


---

## Key Features

### Dependency Graph Visualisation
- Interactive force-directed graph powered by D3.js
- Visual representation of file-level dependencies
- Real-time node interaction and navigation

### AST-Based Code Analysis
- Parses source code using Abstract Syntax Trees (AST)
- Extracts import relationships across modules
- Language-aware parsing system

### Code Exploration
- Clickable nodes to inspect file contents
- Monaco Editor integration for syntax-highlighted preview
- Import + dependency side panel

### Navigation Tools
- Focus mode (local subgraph exploration)
- Depth control for traversal limiting
- Search support for files and nodes

---

## Supported Languages

Current support:
- JavaScript
- TypeScript
- Python

Planned:
- Go
- Java
- C++
- Rust

---

## Architecture Overview
GitHub Repo URL
 →
Backend (Node.js + Express)
 →
Repository Cloning (simple-git)
 →
AST Parsing Layer (@babel/parser, Python AST)
 →
Dependency Graph Builder
 →
JSON Graph API
 →
Frontend Visualisation (React + D3.js)

---

## How It Works

1. User submits a GitHub repository URL
2. Backend clones the repository locally (shallow clone for performance)
3. Source files are scanned and parsed using AST parsers
4. Import statements are extracted and converted into graph edges
5. Nodes and relationships are structured into a graph model
6. Frontend renders the graph using D3.js force simulation

---

## Tech Stack

### Frontend
- React + TypeScript
- D3.js (graph rendering engine)
- Monaco Editor (code viewer)

### Backend
- Node.js + Express
- simple-git (repo cloning)
- @babel/parser (AST parsing)
- fs-extra (file system utilities)

---

## Design Goals

CodeAtlas was built to solve a core developer problem:

> Understanding large codebases is harder than writing them.

Instead of manually tracing imports or navigating folders, CodeAtlas allows developers to:
- Visually explore architecture
- Identify dependency chains quickly
- Understand system structure at a glance

---

## Performance Notes

- Shallow cloning reduces repository load time
- File filtering excludes heavy directories (`node_modules`, `dist`, etc.)
- Import parsing is limited for performance safety
- Graph rendering optimised for medium-scale repositories

---

## Future Improvements

### Core Enhancements
- Folder-level and module-level graph abstraction
- Function and class-level dependency mapping
- Smarter cross-language resolution engine

### Scaling Improvements
- Streaming graph rendering for large repos
- Incremental parsing instead of full repo reload
- Caching layer for repeated repository analysis

### Language Expansion
- Go AST pipeline
- Java class dependency mapping
- C++ include graph parsing

---

## 🤝 Contributions

Contributions are welcome and appreciated.

If you want to improve CodeAtlas:
- Fork the repository
- Create a feature branch
- Submit a pull request

---

## ⭐ Support

If you find CodeAtlas useful:
- Star the repository
- Share it with developers
- Try it on real-world codebases
- Reporting issues or suggesting improvements

---

## 📌 Status

Early-stage but actively developed system focused on real-world repository understanding and developer tooling.
---

## 🤝 Sponsors

CodeAtlas is built and maintained in public.

As the project grows, infrastructure costs (repo processing, graph computation, hosting, and API usage) increase significantly. Sponsors help keep the core platform free and accessible while supporting continued development.

### 💡 Why sponsor?

Supporting CodeAtlas helps fund:
- Backend compute for repository analysis
- Hosting and scaling infrastructure
- Development of new language parsers (Go, Java, C++)
- New features like module-level graphs and AI-assisted code understanding

---

> Every bit of support helps keep CodeAtlas growing.

