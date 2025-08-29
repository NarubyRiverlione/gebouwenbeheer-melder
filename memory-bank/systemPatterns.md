# System Architecture & Patterns

## Layered Architecture
- **Entry Point**: `src/main.ts` initializes the Express application.
- **Routing Layer**: Each feature (reports, clusters, email ingestion) has its own router module under `routes/`. Routers map HTTP endpoints to controller actions.
- **Controller Layer**: Controllers handle HTTP requests, validate inputs, call service methods, and return JSON responses or error codes.
- **Service Layer**: Encapsulates business logic (e.g., clustering algorithm, state transitions). Services coordinate repository calls and data transformations.
- **Repository Layer**: Interfaces with SQLite via a lightweight driver. Each repository (ReportRepository, ClusterRepository) provides CRUD operations and query methods.

## Modular Design
- Features are organized into discrete directories (`routes/`, `controllers/`, `services/`, `repositories/`, `models/`).
- Files aim for 100 lines max; complex logic is further split into private modules.
- Shared utilities (e.g., validation, error handling) live in a `utils/` directory.

## Design Patterns
- **Repository Pattern**: Abstracts database access, returning typed model objects.
- **Dependency Injection (Lightweight)**: Services receive repositories via constructor injection for testability.
- **Factory Pattern**: If needed, for instantiating clustering strategies (e.g., keyword-based vs. ML-based) behind a common interface.
- **Middleware**: Express middleware for logging, error handling, and JSON body parsing.

## Error Handling
- Centralized error-handling middleware captures thrown exceptions and responds with standardized error objects.
- Validation errors return HTTP 400; unexpected errors return HTTP 500.

## Data Models
- TypeScript interfaces in `models/` define schema for `Report` and `IssueCluster`, matching the SQLite table definitions.
- Mapping between raw database rows and TS interfaces is done in the repository layer.

## Configuration
- Environment-based config via `.env` (e.g., database file path, logging level). Use `dotenv` to load at startup.
- Linter and formatter configured in project root: ESLint flat config + Prettier plugin.
