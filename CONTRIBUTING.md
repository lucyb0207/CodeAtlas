# 🤝 Contributing to CodeAtlas

Thank you for investing your time in contributing to **CodeAtlas** 
Your contributions help make codebases easier to understand for developers everywhere.

---

## Overview

This document provides repository-specific guidance for contributing to CodeAtlas.

For general GitHub contribution practices, see:
- https://docs.github.com/en/get-started/quickstart/contributing-to-projects

---

## What CodeAtlas Is

CodeAtlas is a developer tool that transforms GitHub repositories into **interactive dependency graphs**.

We are focused on:
- visualising code structure
- improving developer onboarding
- making large codebases easier to understand

---

## 🚀 Getting Started

### 1. Fork and clone

```bash
git clone https://github.com/your-username/codeatlas.git
cd codeatlas
```
### 2. Install dependencies
#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Run locally
#### Start backend
```bash
cd backend
node server.js
```

#### Start frontend
```bash
cd frontend
npm run dev
```

--- 

## 🛠️ Project Structure
- /backend   → repository analysis, AST parsing, API
- /frontend  → React UI, graph visualisation (D3)

--- 

## Contribution Types

### ✅ We welcome:
- Bug fixes
- Performance improvements
- UI/UX improvements
- New features (discuss first)
- Documentation improvements

### ❌ Avoid:
- Large, unrelated changes in one PR
- Breaking existing functionality
- Adding heavy dependencies without discussion
- Pure stylistic rewrites without clear benefit

---

## Finding Work
Check issues labeled:
- good-first-issue
- frontend
- backend
If unsure, open an issue to discuss your idea

---

## Development Guidelines

### Code Quality
- Keep code simple and readable
- Prefer clarity over cleverness
- Avoid unnecessary abstraction

### Frontend
- Keep UI minimal and fast
- Avoid heavy libraries
- Ensure graph performance is not degraded

### Backend
- Avoid blocking operations where possible
- Handle large repositories safely
- Keep parsing efficient

---

## Commit Guidelines
Use clear, conventional commit messages:

- feat: add copy file path button
- fix: resolve graph node crash
- chore: update dependencies

--- 

## 🔀 Pull Requests
### Before submitting:
- Ensure the app runs locally
- Test your changes
- Keep PR focused on one feature/fix

### PR Requirements:
- Clear description of changes
- Link related issue (e.g. Closes #12)
- Screenshots/GIFs for UI changes
- No unrelated changes

### Review Process
- Maintainer reviews PR
- Feedback may be requested
- Once approved → merged 

---

## 🧠 Technical Notes
- AST Parsing
- Uses @babel/parser and @babel/traverse
- Extracts import relationships between files
- Graph System
- Nodes = files
- Links = imports
- BackLinks = reverse dependencies

### Known Challenges
- Large repositories
- Dynamic imports
- Cross-language parsing

---

## Ideas and Suggestions

### We encourage:

- feature ideas
- performance improvements
- new language support (Go, Java, C++)

Open an issue to discuss before building large features.

---

## ❤️ Supporting CodeAtlas

### If you find CodeAtlas useful:

- Star the repo
- Report bugs
- Suggest features
- Contribute
- Sponsor Us

---

## 🙌 Final Note

CodeAtlas is growing... and contributors shape its future.

Thanks for being part of it 
