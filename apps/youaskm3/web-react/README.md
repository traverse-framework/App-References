# youaskm3 — Web React UI

Browser-hosted knowledge workflow app built on Traverse.

This UI shell owns nothing but rendering. Traverse runtime owns business execution, workflow state, trace generation, and structured output.

## What It Does

User submits a question or knowledge item → Traverse executes the registered workflow → UI renders runtime-provided output (answer, reasoning, status). The UI computes none of these fields.

## Architecture Boundary

| Concern | Lives here |
|---|---|
| React components and UI state | Yes |
| HTTP client to Traverse runtime | Yes (thin boundary only) |
| Business logic, workflow execution | No — Traverse runtime |
| WASM components | No — `manifests/youaskm3/` |

## Local Setup

### Step 1 — Start Traverse runtime (v0.3.0)

```bash
git clone https://github.com/traverse-framework/Traverse.git /tmp/traverse
cd /tmp/traverse && git checkout v0.3.0
cargo run -p traverse-cli -- serve
# Writes .traverse/server.json — base_url=http://127.0.0.1:8787
```

### Step 2 — (Phase 2 only) Register the app

```bash
cd <repo-root>
traverse-cli app validate --manifest manifests/youaskm3/app.manifest.json --json
traverse-cli app register --manifest manifests/youaskm3/app.manifest.json --workspace local-default --json
```

### Step 3 — Start the UI

```bash
npm install
npm run dev
```

### Override for Traverse framework development

```bash
export TRAVERSE_REPO=/path/to/Traverse
cd $TRAVERSE_REPO && cargo run -p traverse-cli -- serve
```

## Commands

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:coverage
```

## Environment

The app discovers the runtime via `.traverse/server.json` (written by `traverse-cli serve`).

Override for CI environments:
```bash
VITE_TRAVERSE_BASE_URL=http://127.0.0.1:8787
VITE_TRAVERSE_WORKSPACE=local-default
```

## Governing Specs

- `033-http-json-api` (approved v1.1.0) — runtime HTTP API
- `044-application-bundle-manifest` (approved) — app manifest model
- `046-public-cli-app-registration` (approved) — CLI validate + register
