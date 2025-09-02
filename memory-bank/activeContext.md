# Active Context

## Done

- Setting up project documentation and architecture for the issue reporting and clustering system.
- Documenting memory bank files to capture project state and next steps.
- Defined project brief outlining goals and scope.
- Created product context detailing user needs and benefits.
- Established primary data schemas for reports and issue clusters in `data-format.md`.
- Initialized placeholder entry point in `src/main.ts`.
- Configure linting and type-checking workflows (`pnpm lint`, `tsc -b`).

## Current Focus 
1. Implement Express server scaffolding:
   - Configure routing modules for report and cluster APIs.
   - Set up SQLite database connectivity.
2. Define TypeScript data models and repository layer for `report` and `issue_cluster`.
3. Develop API endpoints for:
   - Creating and querying reports.
   - Triggering clustering process.
   - Ingesting email content to extract structured report data, returning validation errors for missing mandatory fields.
   - Retrieving and resolving issue clusters.

## Next Steps
4. Encapsulate business logic in separate service modules.
6. Write unit/integration tests for core functionality.
7. Update progress documentation as features are implemented.
   - Scaffold `docs/requests.http` with example requests and add `test:api` npm script (httpyac)

8. Implement JWT-based API authentication:
   - Add `/auth/login` token-issuance endpoint.
   - Add `authenticateJWT` middleware to protect report and clustering routes.
   - Generate a test JWT fixture in `.env.test`.
   - Configure Playwright E2E to read test JWT and inject `Authorization: Bearer <token>`.
   - Write E2E smoke test: obtain JWT, bulk POST reports, assert persistence.

## Active Decisions

- Use SQLite for lightweight, file-based storage.
- Keep modules small (100–200 lines) and separate business logic from routing.
- Enforce strict TypeScript (no `any`) and prefer `const` over `let`.
- Manage dependencies with pnpm and run via `tsx` in development.
- All documentation, variable names, and comments must be in English; reported issue content will be in Dutch.
- Use vitest for end-to-end bulk-report creation tests within this project.
