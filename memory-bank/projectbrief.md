# Project Brief

The goal of this project is to implement a structured issue reporting and clustering system. It will:

- Accept and store issue reports submitted in a predefined data format, persisting them in a SQLite database with metadata (timestamp, processed flag, resolved flag).
- Provide REST APIs to:
  - Add new reports.
  - Retrieve the count of unprocessed reports.
  - List all reports.
  - Query reports within a time range, optionally filtering by processed or resolved status.
- Process unprocessed reports to form clusters of related issues via a dedicated processing API.
- Provide an API to ingest email content, analyze it to extract structured report data, and return validation errors for missing mandatory fields.
- Expose APIs to:
  - Retrieve unresolved issue clusters.
  - Mark an issue cluster as resolved (which cascades resolution to all related reports).

This system will be built using Node.js with TypeScript, Express.js for the HTTP API layer, and SQLite for data storage, following a modular design with separation of business logic into small files.
