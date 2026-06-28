# App-References Plan

## Purpose

This repo holds reference UI applications that demonstrate integrating a React frontend with the Traverse runtime. Each app is a thin UI layer — it starts workflows, receives events, and renders runtime-provided structured output without owning any business logic.

## Apps In This Repo

| App | Path | Status |
|---|---|---|
| `traverse-starter` | `apps/traverse-starter/web-react` | Phase 1 in progress |
| `youaskm3` | `apps/youaskm3/web-react` | Planned |

---

## Architecture Boundary

**This repo is UI-only.**

| Concern | Lives in |
|---|---|
| React UI shells | This repo |
| Runtime event client (thin boundary only) | This repo |
| App manifests and WASM component manifests | This repo (`manifests/<app>/`) |
| Business capabilities and workflow execution | Traverse runtime (external) |
| Business output fields (tags, title, note type, etc.) | Traverse runtime (external) |
| Traverse CLI/runtime binary | External — pinned to `v0.3.0` |

The React UI must not compute business fields. It renders, sorts, filters, and displays data provided by the runtime.

## Accepted Decisions

- Phase 1 does not require live AI/model access — runtime determinism is guaranteed
- No private Traverse internals are imported into this repo
- No HTTP app registration endpoint — setup uses `traverse-cli app validate` + `traverse-cli app register`
- No service registry — discovery via `.traverse/server.json`
- No fake business logic or fake registration in the UI
- Canonical consumer path pins `v0.3.0` of the Traverse source build
- `TRAVERSE_REPO=/path/to/Traverse` env override is supported for active framework development only

## Traverse Runtime API (Resolved)

The public integration surface is governed by spec `033-http-json-api` (approved, v1.1.0).

| Detail | Value |
|---|---|
| Start runtime | `cargo run -p traverse-cli -- serve` |
| Default address | `127.0.0.1:8787` |
| Discovery file | `.traverse/server.json` |
| Default workspace | `local-default` |
| Health check | `GET /healthz` |
| Execute capability | `POST /v1/workspaces/{workspace_id}/execute` |
| Poll execution | `GET /v1/workspaces/{workspace_id}/executions/{execution_id}` |
| Fetch trace | `GET /v1/workspaces/{workspace_id}/traces/{execution_id}` |
| Error format | RFC 9457 Problem Details |
| App validate | `traverse-cli app validate --manifest <path> --json` |
| App register | `traverse-cli app register --manifest <path> --workspace <id> --json` |

Discovery sequence:
```bash
BASE_URL="$(jq -r '.base_url' .traverse/server.json)"
WORKSPACE_ID="$(jq -r '.workspace_default' .traverse/server.json)"
```

## Governing Specs (in Traverse repo)

| Spec | Status | Governs |
|---|---|---|
| `033-http-json-api` | ✅ Approved v1.1.0 | HTTP+JSON runtime API, execute, trace, discovery |
| `044-application-bundle-manifest` | ✅ Approved | App manifest, WASM component manifests, validation |
| `046-public-cli-app-registration` | ✅ Approved | `traverse-cli app validate` + `app register` |
| `013-browser-runtime-subscription` | ⚠️ Draft | Browser event subscription contract |
| `019-local-browser-adapter-transport` | ⚠️ Draft | Local browser adapter transport |

Phase 1 is governed by spec `033`. Phase 2 is governed by specs `044` and `046` — both are approved.

---

## traverse-starter

### Purpose

The simplest possible Traverse reference app. User enters a short note → Traverse processes it → UI renders runtime-provided structured output.

### Phase 1 — HTTP Integration

**Governing spec**: `033-http-json-api`

**Deliverables:**

1. **UI shell** — `apps/traverse-starter/web-react`
   - React 18 + TypeScript + Vite + Vitest + ESLint
   - Node version pinned in `.nvmrc`
   - Configured for local Traverse runtime discovery via `.traverse/server.json`

2. **Runtime HTTP client**
   - Reads `.traverse/server.json` for `base_url` and `workspace_default`
   - `POST /v1/workspaces/{workspace_id}/execute` to start capability
   - `GET /v1/workspaces/{workspace_id}/executions/{execution_id}` to poll
   - UI state: loading → polling → complete / error
   - No private Traverse internals imported

3. **Deterministic UI flow**
   - User enters a short note input
   - UI sends to Traverse runtime via HTTP execute
   - UI renders runtime-provided: `title`, `tags`, `noteType`, `suggestedNextAction`, `status`
   - UI computes none of these fields

4. **Phase 1 smoke test**
   - Connects to local Traverse runtime at `127.0.0.1:8787`
   - POSTs execute request with fixture input
   - Polls for completion
   - Asserts required output fields present and non-empty

### Phase 2 — App Registration

**Governing specs**: `044-application-bundle-manifest`, `046-public-cli-app-registration`

**Deliverables:**

1. App manifest at `manifests/traverse-starter/app.manifest.json`
2. WASM component manifest(s) in `manifests/traverse-starter/components/`
3. CLI validation + registration in setup script
4. Runtime loads registered workspace state
5. Phase 2 smoke test proves end-to-end path

---

## youaskm3

### Purpose

The primary downstream reference app. A browser-hosted knowledge workflow app that uses Traverse for runtime execution, workflow state progression, trace generation, and MCP-facing behavior. Demonstrates the full app-consumable path including app bundle registration.

### Phase 1 — HTTP Integration

**Governing spec**: `033-http-json-api`

Same HTTP integration pattern as traverse-starter, applied to a knowledge Q&A workflow.

**Deliverables:**

1. **UI shell** — `apps/youaskm3/web-react`
2. **Runtime HTTP client** — same boundary as traverse-starter
3. **Knowledge workflow UI**
   - User submits a question or knowledge item
   - UI sends to Traverse via HTTP execute
   - UI renders runtime-provided output: answer, sources, reasoning trace, status
4. **Phase 1 smoke test**

### Phase 2 — App Registration

**Governing specs**: `044-application-bundle-manifest`, `046-public-cli-app-registration`

**Deliverables:**

1. App manifest at `manifests/youaskm3/app.manifest.json`
2. WASM component manifests in `manifests/youaskm3/components/`
3. `traverse-cli app validate --manifest manifests/youaskm3/app.manifest.json --json`
4. `traverse-cli app register --manifest manifests/youaskm3/app.manifest.json --workspace local-default --json`
5. Runtime loads registered app → UI invokes registered workflow
6. Phase 2 smoke test proves end-to-end path

---

## Traverse Dependency Model

```bash
# Default: Traverse v0.3.0 source build
git clone https://github.com/traverse-framework/Traverse.git
cd Traverse && git checkout v0.3.0
cargo run -p traverse-cli -- serve

# Override for active framework development
TRAVERSE_REPO=/path/to/Traverse
```

Requirements: Rust 1.94+, local source checkout of Traverse `v0.3.0`.

Do not assume the Traverse repo is present unless confirmed. The canonical path is a pinned v0.3.0 source build.

## Proposed Smoke Tests

### Phase 1 (traverse-starter and youaskm3)

```
1. cargo run -p traverse-cli -- serve (in Traverse v0.3.0)
2. Confirm .traverse/server.json written
3. POST /v1/workspaces/local-default/execute with fixture input
4. Poll GET /v1/workspaces/local-default/executions/{id} until completed
5. Assert output fields present and non-empty
6. Assert no business field computed in UI
```

### Phase 2 (youaskm3)

```
1. traverse-cli app validate --manifest manifests/youaskm3/app.manifest.json --json → exit 0
2. traverse-cli app register --manifest manifests/youaskm3/app.manifest.json --workspace local-default --json → exit 0
3. cargo run -p traverse-cli -- serve
4. Confirm registered workflow is discoverable
5. Execute workflow via HTTP API
6. Assert output matches registered app behavior
```

## Open Questions (updated)

| # | Question | Status |
|---|---|---|
| 1 | What is the pinned Traverse CLI version? | ✅ Resolved — `v0.3.0` source build |
| 2 | What does the runtime event client interface look like? | ✅ Resolved — HTTP+JSON, spec `033` |
| 3 | What is the local runtime discovery mechanism? | ✅ Resolved — `.traverse/server.json`, port `8787`, workspace `local-default` |
| 4 | What fields does the runtime guarantee in final output? | ⚠️ Pending — depends on registered capability contract |
| 5 | Is there an existing app manifest schema? | ✅ Resolved — spec `044` is approved |
| 6 | Does Phase 2 CLI registration exist in any released build? | ✅ Resolved — spec `046` is approved; verify implementation in v0.3.0 |

## Ticket Index

### traverse-starter

| # | Title | Status |
|---|---|---|
| 1 | Define traverse-starter UI-only reference app plan | Done |
| 7 | Enable branch protection on main | Ready |
| 8 | Track project governance and CI setup | Done |
| 9 | Pin Traverse runtime to v0.3.0 and document local discovery | Ready |
| 2 | Scaffold web React UI shell for traverse-starter | Ready |
| 3 | Add runtime event client boundary for web React | Ready |
| 4 | Add deterministic traverse-starter UI flow | Ready |
| 5 | Add Phase 1 smoke test | Ready |
| 6 | Track Phase 2 app registration integration | Ready (unblocked — spec 046 approved) |

### youaskm3

| # | Title | Status |
|---|---|---|
| 10 | Define youaskm3 reference app plan and scope | Ready |
| 11 | Scaffold youaskm3 web React UI shell | Ready |
| 12 | Author youaskm3 app manifest and WASM component manifests | Ready |
| 13 | Add youaskm3 runtime HTTP client | Ready |
| 14 | Implement youaskm3 knowledge workflow UI | Ready |
| 15 | Add youaskm3 Phase 1 smoke test | Ready |
| 16 | Implement youaskm3 CLI app validation and registration (Phase 2) | Ready |
| 17 | Add youaskm3 Phase 2 smoke test | Ready |
