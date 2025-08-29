# Purpose

Aldo all documentation, variable names and comments in code must be in English the reported issues will be in Dutch. This will be important for phase 2 to analyse the reports.

## 1. Store reported issues

Issues will be reported via an in a structured format (data-format.md) and
should be stored in a database with the datetime of recording and the flag processed and resolved shouldn't be set.

There are api's for :

- adding a report
- get the get the number of unprocessed reports.
- get all reports
- get reports for a certain time until now, optional filter (un)processed and (un)resolved

## 2. Create Issue clusters

There is an api to trigger the processing of the reports.
This process will read all unprocessed reports and bundle them in issue clusters ( see data-format.md). This process will be later on described.

There are api's for :

- get the unresolved issue clusters
- set a issue cluster as resolved, this should also set all related reports as resolved

## 3. Create report from an email
An api will be provided to send the content of an email. The email will be analyzed to find the need structured information to store a report. If mandatory information isn't found then this will be in the response of the api.

# Technical

## Main stack

- nodeJs with Typescript
- eslint flat config with prettier
- pnpm instead of npm
- use node LTS version via nvm
- sql lite as database
- expressJS as API endpoints


## CI/CD

- GitHub Actions workflows (push to `main`):
  - **Lint**: runs `pnpm lint` (ESLint + `tsc -b --noEmit`)
  - **Test**: runs `pnpm test`
  - **Build**: runs `pnpm build`
- All workflows use Node.js 20 (LTS) via `actions/setup-node` and `.nvm`
- _Planned_: upload `dist/` artifacts and create GitHub Releases

## Memory Bank

This project uses a Memory Bank to maintain context between sessions:
- Core documentation in `memory-bank/` (projectbrief.md, productContext.md, systemPatterns.md, techContext.md, activeContext.md, progress.md)
- After implementing features or making significant changes, update the relevant memory-bank files.
- The Memory Bank ensures continuity and clear project history across development sessions.

### Starting a New Feature

- Before beginning a new feature, review all files in `memory-bank/` to load the current project context into your session (e.g., open in your editor or use the `read_file` tool).
- Define your feature scope and planned changes in `activeContext.md` under “Next Steps”.
- In your first AI interaction, use the `read_file` tool on all `memory-bank/` files to preload context with Cline.

### Updating the Memory Bank

- After implementing changes or completing a feature, update:
  - `activeContext.md`: record recent changes and new next steps.
  - `progress.md`: mark completed items and outline remaining tasks.
  - Other memory-bank files (`systemPatterns.md`, `techContext.md`) when introducing new patterns or technologies.
- Commit these updates alongside your code to maintain an accurate project history.

## Repository Setup for Contributors

- Clone the repository, ensuring the `.clinerules/` directory and `memory-bank/` directory are included.
- The `.clinerules/custom_instructions.md` file contains the Memory Bank commands and must be present.
- When starting a session, open all files in `memory-bank/` or use the `read_file` tool to load project context.
