# youaskm3 Plan

## Purpose

youaskm3 is the primary downstream reference app for Traverse. It is a browser-hosted knowledge workflow app that demonstrates the full app-consumable path:

- Phase 1: UI → HTTP execute → poll → render runtime output
- Phase 2: app manifest → `traverse-cli app validate` → `traverse-cli app register` → runtime loads → UI invokes registered workflow

## Architecture Boundary

**UI layer (this repo):**
- React shell at `apps/youaskm3/web-react`
- Thin HTTP client using spec-033 surfaces only
- App manifests at `manifests/youaskm3/`

**Traverse runtime (external):**
- WASM component execution
- Workflow state machine
- Structured output fields (answer, reasoning, status)
- Trace generation

The UI renders, sorts, filters, and displays runtime-provided data. It computes nothing.

## Phase 1 — HTTP Integration

**Governing spec:** `033-http-json-api` (approved v1.1.0)

**Runtime surface used:**
```
GET  /healthz
POST /v1/workspaces/{workspace_id}/execute
GET  /v1/workspaces/{workspace_id}/executions/{execution_id}
GET  /v1/workspaces/{workspace_id}/traces/{execution_id}
```

**Discovery:** `.traverse/server.json` → `base_url`, `workspace_default`

**UI states:** idle → submitting → polling → succeeded / failed

**Runtime-provided output fields (UI renders, does not compute):**
- `answer` or result
- `reasoning` or trace summary
- `status`
- `executionId`

## Phase 2 — App Registration

**Governing specs:** `044-application-bundle-manifest`, `046-public-cli-app-registration` (both approved)

**CLI surface:**
```bash
traverse-cli app validate --manifest manifests/youaskm3/app.manifest.json --json
traverse-cli app register --manifest manifests/youaskm3/app.manifest.json --workspace local-default --json
```

**What registration unlocks:** runtime loads the registered WASM workflow → UI invokes it by capability ID → full end-to-end path without harness shortcuts.

## Ticket Sequence

| # | Ticket | Depends on |
|---|---|---|
| 10 | Define youaskm3 plan (this doc) | #9 |
| 11 | Scaffold React UI shell | #10, #2 (toolchain) |
| 12 | Author app manifest + WASM component manifests | #10, #9 |
| 13 | Add Traverse HTTP runtime client | #11, #3 |
| 14 | Implement knowledge workflow UI | #13 |
| 15 | Add Phase 1 smoke test | #14 |
| 16 | Phase 2 CLI validate + register | #12, #13 |
| 17 | Add Phase 2 smoke test | #16, #15 |

## Open Questions

1. What capability ID does the youaskm3 workflow register under? (needed for `POST /execute`)
2. What are the exact input fields the Traverse workflow expects from the UI?
3. What output fields does the registered workflow guarantee in the execution envelope?
4. Are the WASM components pre-built artifacts or does this repo need to reference an external build?
5. What model dependency does the knowledge workflow require? (ref spec `045`)

## Constraints

- No business logic in the React layer
- No private Traverse internals imported
- No fake runtime responses in application code
- No HTTP app registration endpoint — setup uses CLI only
- Phase 2 does not start until #12 (manifests) passes `traverse-cli app validate`
