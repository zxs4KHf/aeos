# AEOS Project Context

- Last verified: 2026-07-18
- Verified against commit: `676cfbc`
- Scope: durable purpose, architecture, boundaries, and primary development entry points
- Known gaps: GitHub page-based onboarding is a candidate, not an implemented feature.

## Purpose

`[VERIFIED]` AEOS is an agent-agnostic engineering policy compiler with optional workflow guidance. It helps individual developers, teams, and tool builders keep engineering instructions portable across AI coding agents. Source: `README.md`, `memory/PROJECT_CONTEXT.md`.

AEOS is a governance and context layer. `[VERIFIED]` It does not implement a model runtime, permission sandbox, autonomous orchestrator, database, background process, or editor Artifact synchronization service. Source: `README.md`, `roadmap/architecture_v2.md`.

## Architecture

`[VERIFIED]` `policies/core.json` and `adapters/config.json` feed `adapters/compiler.js`, which validates policy/configuration, renders concise native entries, writes deterministic artifacts under `dist/`, and emits `dist/manifest.json`. Source: `adapters/compiler.js`, `test/compiler.test.js`.

`[VERIFIED]` `adapters/integrator.js` deploys platform entries and on-demand knowledge into a target project. It protects target boundaries, detects managed-file changes via `.aeos/install-manifest.json`, rejects unsafe overwrites by default, and backs up forced replacements. Source: `adapters/integrator.js`, `test/integrator.test.js`.

`[VERIFIED]` Reusable details live in `constitution/`, `standards/`, `workflows/`, `playbooks/`, and `templates/`; the always-loaded entry is constrained to 120 lines. Source: `adapters/config.json`, `policies/core.json`.

## Durable Invariants

- `[VERIFIED]` Host safety and permission controls outrank AEOS prose. Source: `policies/core.json`.
- `[VERIFIED]` Generated entry files must be deterministic and within the configured line budget. Source: `adapters/compiler.js`, `test/compiler.test.js`.
- `[VERIFIED]` Compiler and installer paths cannot escape their intended repository roots. Source: `test/compiler.test.js`, `test/integrator.test.js`.
- `[VERIFIED]` Unmanaged target files are never overwritten without `--force` and a backup. Source: `adapters/integrator.js`, `test/integrator.test.js`.
- `[VERIFIED]` `memory/` describes AEOS-owned facts; `.context/` is a PCB-compatible recovery layer and does not replace it. Source: `memory/ARCHITECTURE.md`, `memory/DECISIONS.md`.

## Development Entry Points

- Install: `npm ci`
- Build platform artifacts: `npm run build`
- Run tests: `npm test`
- Full verification: `npm run verify`
- Preview target integration: `node adapters/integrator.js --path <project> --platform <platform> --dry-run`
- CI: `.github/workflows/ci.yml` runs `npm ci` and `npm run verify` on pushes and pull requests.
