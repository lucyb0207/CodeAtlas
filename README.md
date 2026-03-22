
![Developer Banner 5](https://ishan-rest.vercel.app/svg/banner/dev5/CodeAtlas)
# CodeAtlas

Visualise and explore any GitHub repository as an interactive dependency graph. Currently supports JavaScript and TypeScript projects, with plans to expand to more languages like Python and C++.

## Features

- Dependency graph (D3.js)
- Import + dependent tracking
- Interactive nodes
- Monaco code preview
- Search functionality

## Tech Stack

Frontend:
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
- ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
- ![D3.js](https://img.shields.io/badge/D3.JS-%23000000?style=for-the-badge&logo=D3&logoColor=#ff823e)

Backend:
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
- simple-git
- @babel/parser


Examples:
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
