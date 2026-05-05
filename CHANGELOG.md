# 📜 Changelog

All notable changes to **CodeAtlas** will be documented in this file.

---

## [Unreleased]

### 🚀 Added
- Copy file path button in File Inspector
- Improved dependency resolution for local imports
- Backlinks tracking (files that depend on a file)
- Rate limiting on `/analyze` endpoint

### 🛠️ Changed
- Improved graph formatting and normalization
- Refactored frontend API handling for flexibility
- Better handling of invalid graph responses

### 🐛 Fixed
- D3 crash (`node not found`) when imports point to non-existent nodes
- Backend returning HTML instead of JSON on errors
- Duplicate links in graph output

### 🧪 Testing
- Added Jest setup for parser
- Added initial parser unit tests
- Ignored `/tmp` folder during tests

---

## [0.1.0] - Initial Release

### 🚀 Added
- GitHub repo analysis via URL
- Automatic repo cloning using `simple-git`
- AST-based import extraction (JS, TS, JSX, TSX)
- Dependency graph generation (nodes + links)
- Interactive graph visualization (D3.js)
- File inspector panel
- Monaco editor integration for file preview

### 🧠 Core Features
- Graph-based codebase exploration
- Import relationship mapping
- Focus mode (depth-based filtering)
- Multi-language support (JavaScript, TypeScript, Python)

---

## 🔮 Upcoming

- Folder → File → Module hierarchy view
- Support for Go language
- Function-level dependency analysis
- Graph performance optimizations (large repos)
- GitHub API integration (no local cloning)
- Export/share graphs
- Circular Dependency detection and dynamic imports
- Private repo support and local file analysis

---

## 📌 Notes

- Early-stage project: rapid iteration expected
- Breaking changes may occur before v1.0.0
