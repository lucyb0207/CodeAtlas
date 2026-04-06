
![Developer Banner 5](https://ishan-rest.vercel.app/svg/banner/dev5/CodeAtlas)
# CodeAtlas

## Turn any GitHub repository into an interactive dependency graph

CodeAtlas turns any GitHub repository into an interactive dependency graph, allowing you to visualise and explore the structure of a codebase in real time. It currently supports JavaScript, TypeScript and Python, with planned support for languages including C++ and Java.

<img width="1054" height="815" alt="Screenshot 2026-03-21 at 08 56 39" src="https://github.com/user-attachments/assets/f11efaba-b8b4-4a1d-b93d-26e499ae0296" />


## Features

- Interactive dependency graph visualisation powered by D3.js
- Automatic extraction of import and dependecy relationships across files
- Interactive nodes for exploration of repository structure
- Integrated Monaco Editor for live code preview
- Fast search across files and graph nodes
- Multi-language support (JavaScript, TypeScript, Python)

## Supported Languages

- JavaScript
- TypeScript
- Python 


## How It Works

1. A GitHub repository URL is provided by the user
2. The repository is cloned locally using `simple-git`
3. Source files are then analysed using language-specific AST parsers
4. Import and dependency relationships are extracted and structured into a graph model
5. The dependency graph is rendered interactively using D3.js 


## Tech Stack

Frontend:
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
- ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
- ![D3.js](https://img.shields.io/badge/D3.JS-%23000000?style=for-the-badge&logo=D3&logoColor=#ff823e)
- Monaco Editor

Backend:
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
- simple-git
- @babel/parser
- Python (AST Parsing)

## Screenshot:

<img width="1576" height="830" alt="Screenshot 2026-03-21 at 08 57 19" src="https://github.com/user-attachments/assets/68be7f91-f5b7-4fca-80ed-939e160a4d30" />


## Installation

### Prerequisites

Before running CodeAtlas, make sure you have installed:
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Python 3.10+
- Git (latest version recommended)

To verify installation:
```bash
node -v
npm -v
python --version
git --version
```

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

### Installation Notes
- The backend must be running before starting the frontend
- Make sure ports used by backend/frontend are not already in use
- Python must be available in your system path for AST parsing

## Why I Built CodeAtlas

Understanding large codebases is one of the biggest challenges in software development. When working with unfamiliar repositories, developers often need to manually trace imports and navigate between files to understand how everything connects.

I built CodeAtlas to solve this problem by turning static code into a visual system. By representing files and their relationships as an interactive graph, developers can explore structure more intuitively and reduce the time spent understanding complex projects.

This project also allowed me to explore:
- Abstract Syntax Tree (AST) parsing across multiple languages  
- Graph data structures and dependency modelling  
- Building full-stack tools with real-world developer use cases  

## Future Improvements

- Extend language support to other languages, starting with C++, Java and Go through additional parsing pipelines
- Implement real-time analysis using GitHub API instead of local cloning
- Enhance AST parsing to include function-level and class-level dependencies
- Introduce hierarchical graph views (folder -> file -> module) for better scalability
- Optimise graph rendering for large repositories using progressive loading techniques

## Contributions

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. Don't forget to give the project a star! Thanks again!

