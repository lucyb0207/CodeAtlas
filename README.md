# CodeAtlas

Visualise and explore any GitHub repository as an interactive dependency graph.

## Features

- Dependency graph (D3.js)
- Import + dependent tracking
- Interactive nodes
- Monaco code preview
- Search functionality

## Tech Stack

Frontend:
- React + TypeScript
- D3.js
- Monaco Editor

Backend:
- Node.js + Express
- simple-git
- @babel/parser

## How It Works

1. Enter a GitHub repo URL  
2. Repo is cloned locally  
3. Files are parsed (AST)  
4. Import relationships extracted  
5. Graph rendered  

## Installation

### Backend
```bash
cd backend
npm install
node server.js
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```