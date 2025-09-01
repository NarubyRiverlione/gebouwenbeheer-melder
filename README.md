# Gebouwenbeheer Melder

Structured issue reporting and clustering system built with Node.js, Express, and SQLite.

## Features

- Store and query structured issue reports  
- Bulk ingest email content into structured reports with validation  
- Automatic clustering of unprocessed reports  
- Mark clusters resolved (cascades resolution to reports)  
- Filter and count reports by processed/resolved status and date range  

## Tech Stack

- Node.js (ESM) with TypeScript  
- Express.js for REST APIs  
- SQLite (via better-sqlite3) for data storage  
- Vitest & Supertest for unit/integration tests  
- ESLint + Prettier for linting/formatting  
- pnpm for package management  
- GitHub Actions for CI (Node.js 18.x & 20.x)

## Setup

```bash
git clone https://github.com/NarubyRiverlione/gebouwenbeheer-melder.git
cd gebouwenbeheer-melder
pnpm install
```

Copy environment variables:

```bash
cp .env.example .env
# .env:
# PORT=3000
# DB_FILE=database.sqlite
```

## Development

```bash
pnpm dev
# Server listens on http://localhost:3000
```

## Scripts

- `pnpm lint` – run ESLint & TypeScript checks  
- `pnpm test` – run Vitest unit & integration tests  
- `pnpm test -- --coverage` – generate coverage report (text, lcov, html)  
- `pnpm build` – compile TypeScript to `dist/`  
- `pnpm start` – run compiled server  

## API Reference

### Reports

- **POST /reports**  
  Create a new report  
  Body: `NewReport` JSON  

- **GET /reports**  
  List all reports  

- **GET /reports/unprocessed**  
  List unprocessed reports  

- **GET /reports/countUnprocessed**  
  `{ count: number }` of unprocessed reports  

- **GET /reports/query?start=&end=&processed=&resolved=**  
  Filter reports by timestamp range and status flags  

- **POST /ingest**  
  Ingest raw email content into a report  
  Body: Partial report JSON; requires `message` field  

### Clusters

- **POST /clusters/process**  
  Process and cluster all unprocessed reports  

- **GET /clusters**  
  List all unresolved clusters  

- **POST /clusters/:id/resolve**  
  Mark a cluster (and its reports) as resolved  

## Testing

All tests run against an in-memory SQLite database.

Run tests:
```bash
pnpm test
```

Generate coverage report:
```bash
pnpm test -- --coverage
```

Coverage output includes text summary, lcov, and HTML report in `/coverage` directory.

## CI/CD

Workflows defined under `.github/workflows/` for:
- Linting (ESLint & TypeScript)  
- Testing (Vitest)  
- Building (TypeScript compile)  

## Debugging

VSCode launch configurations are available in `.vscode/launch.json`.  
- "Debug TypeScript (tsx)" runs the app via `tsx` with source maps.  
- "Debug Compiled JavaScript" builds and launches the compiled `dist/main.js`.  
Use F5 to start debugging and set breakpoints in your TypeScript code.

## Memory Bank

Documentation in `memory-bank/` tracks project context and progress.
