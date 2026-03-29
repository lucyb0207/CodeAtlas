
![Developer Banner 5](https://ishan-rest.vercel.app/svg/banner/dev5/CodeAtlas)
# CodeAtlas

Visualise and explore any GitHub repository as an interactive dependency graph. Currently supports JavaScript, TypeScript and Python projects, with plans to expand to more languages like C++/Java.

## Table of Contents
1. [ Features ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#features)
2. [ Tech Stack ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#tech-stack)
3. [ Examples ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#examples)
4. [ How It Works ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#how-it-works)
5. [ Installation ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#installation)
6. [ Contributions ](https://github.com/lucyb0207/CodeAtlas?tab=readme-ov-file#contributions)

## Features

- Dependency graph (D3.js)
- Import + dependent tracking
- Interactive nodes
- Monaco code preview
- Search functionality
- Multi-language support (JavaScript, TypeScript, Python)

## Supported Languages

- JavaScript
- TypeScript
- Python 

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

## Examples:
<img width="1054" height="815" alt="Screenshot 2026-03-21 at 08 56 39" src="https://github.com/user-attachments/assets/f11efaba-b8b4-4a1d-b93d-26e499ae0296" />

<img width="1576" height="830" alt="Screenshot 2026-03-21 at 08 57 19" src="https://github.com/user-attachments/assets/68be7f91-f5b7-4fca-80ed-939e160a4d30" />



## How It Works

1. Enter a GitHub repo URL  
2. Repo is cloned locally  
3. Files are parsed using language-specific AST parsers  
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

## Contributions

Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. Don't forget to give the project a star! Thanks again!

