# traverse-starter (Web React UI)

This is the React UI shell for the `traverse-starter` reference application. It represents a thin presentation layer that connects to the Traverse runtime.

## Core Design Principles

1. **UI is a Rendering Layer only**: All business fields (such as notes tags, title, note type, suggested actions, and workflow status) are calculated and owned by the Traverse runtime. The UI only displays and subscribes to events.
2. **Strict Boundary Isolation**: No private Traverse internals are imported into this codebase. All communication occurs over the public API surface.

## Configuration & Runtime Discovery

The React shell connects to the Traverse runtime via HTTP endpoints. By default, it discovers the runtime at:

- `http://localhost:3000` (configurable via `VITE_TRAVERSE_RUNTIME_URL` env variable).

You can define this environment variable in `apps/traverse-starter/web-react/.env` or in your system environment.

### Traverse CLI Pinned Release

The project expects a pinned release of the Traverse CLI for executing tasks and workflow orchestration:

```bash
# Canonical path: runs the pinned release of the Traverse CLI
npx traverse-cli serve
```

### TRAVERSE_REPO Override Behavior (Framework Development)

For active framework development or testing local changes to the Traverse framework itself, you can override the pinned release by pointing to a local Traverse repository check-out:

```bash
# Environment override for active framework developers
TRAVERSE_REPO=/path/to/local/Traverse npx traverse-cli serve
```

When `TRAVERSE_REPO` is set, scripts and test runners will locate and execute the local CLI binaries inside that directory (e.g. `cargo run -p traverse-cli -- serve`) instead of invoking the npm-distributed package.

## Development Commands

Run the following commands from the root directory of the workspace:

```bash
# Install all dependencies across workspaces
npm install

# Start the React app in local development mode
npm run dev

# Compile TypeScript and build the static distribution bundle
npm run build

# Perform type-checking
npm run typecheck

# Lint all source files
npm run lint

# Run all unit tests using Vitest
npm run test

# Run unit tests and generate coverage reports
npm run test:coverage
```
