# Technical Context

## Runtime & Language
- Node.js LTS (managed via nvm)
- TypeScript v5.9.2 for static typing
- ts-node for running TypeScript directly in development

## Frameworks & Libraries
- Express.js for building RESTful HTTP APIs
- sqlite3 (or better-sqlite3) as lightweight, file-based SQL database driver
- dotenv for loading environment variables from `.env`

## Tooling & Configuration
- pnpm@10.15.0 for package management
- ESLint (flat config) with:
  - @eslint/js
  - @typescript-eslint/parser & plugin
  - eslint-plugin-prettier & eslint-config-prettier
- Prettier for code formatting
- tsconfig.json with:
  - `strict` type checking (noImplicitOverride, noUnusedLocals, etc.)
  - `module: nodenext`, `target: esnext`
  - `rootDir: src`, `outDir: dist`
  - Source maps enabled

## Scripts
- `pnpm dev` → `ts-node src/main.ts`
- `pnpm lint` → `eslint . --fix && pnpm tsc -b --noEmit`
- `pnpm build` → `tsc -b`
- `pnpm start` → `node dist/main.js`
- `pnpm watch` → `tsc -w --noEmit`

## Conventions & Constraints
- No use of the `any` type; prefer `const` over `let`
- Modular design: small files (<200 lines), separate layers (routes, controllers, services, repositories, models)
- Consistent code style enforced by ESLint + Prettier
- All documentation, variable names, and comments must be in English; reported issue content will be in Dutch.
