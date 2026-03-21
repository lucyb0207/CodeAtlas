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


Examples
<img width="1054" height="815" alt="Screenshot 2026-03-21 at 08 56 39" src="https://github.com/user-attachments/assets/f11efaba-b8b4-4a1d-b93d-26e499ae0296" />

<img width="1576" height="830" alt="Screenshot 2026-03-21 at 08 57 19" src="https://github.com/user-attachments/assets/68be7f91-f5b7-4fca-80ed-939e160a4d30" />



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
