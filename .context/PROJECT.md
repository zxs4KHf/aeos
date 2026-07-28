# AEOS Project Context

- Last verified: 2026-07-28
- Verified against: `codex/recover-claude-alpha4` worktree after `d6d5220`
- Scope: durable purpose, architecture, boundaries, and primary development entry points
- Known gaps: npm publication needs authorized scope credentials, and real multi-Agent A/B evidence remains incomplete.

## Purpose

`[VERIFIED]` AEOS is an agent-agnostic engineering policy compiler with optional workflow guidance. It helps individual developers, teams, and tool builders keep engineering instructions portable across AI coding agents. Source: `README.md`, `memory/PROJECT_CONTEXT.md`.

AEOS is a governance and context layer. `[VERIFIED]` It does not implement a model runtime, permission sandbox, autonomous orchestrator, database, background process, or editor Artifact synchronization service. Source: `README.md`, `roadmap/architecture_v2.md`.

## Architecture

`[VERIFIED]` `policies/core.json` and `adapters/config.json` feed `adapters/compiler.js`, which validates policy/configuration, renders concise native entries, writes deterministic artifacts under `dist/`, and emits `dist/manifest.json`. Source: `adapters/compiler.js`, `test/compiler.test.js`.

`[VERIFIED]` `adapters/integrator.js` deploys platform entries and on-demand knowledge into a target project. It protects target boundaries, detects managed-file changes via `.aeos/install-manifest.json`, rejects unsafe overwrites by default, and backs up forced replacements. Source: `adapters/integrator.js`, `test/integrator.test.js`.

`[VERIFIED]` `bin/aeos.js` is the unified CLI; `action.yml` and GitHub workflow templates wrap it without bypassing installer safety. `eval/` provides context-cost measurement, Agent-neutral adherence scoring, and three runnable fixture repositories. Source: `bin/aeos.js`, `action.yml`, `eval/`, `test/cli.test.js`, `test/eval.test.js`.

`[VERIFIED]` Reusable details live in `constitution/`, `standards/`, `workflows/`, `playbooks/`, and `templates/`; the always-loaded entry is constrained to 120 lines. Source: `adapters/config.json`, `policies/core.json`.

## Durable Invariants

- `[VERIFIED]` Host safety and permission controls outrank AEOS prose. Source: `policies/core.json`.
- `[VERIFIED]` Generated entry files must be deterministic and within the configured line budget. Source: `adapters/compiler.js`, `test/compiler.test.js`.
- `[VERIFIED]` Compiler and installer paths cannot escape their intended repository roots. Source: `test/compiler.test.js`, `test/integrator.test.js`.
- `[VERIFIED]` Unmanaged target files are never overwritten without `--force` and a backup. Source: `adapters/integrator.js`, `test/integrator.test.js`.
- `[VERIFIED]` `memory/` describes AEOS-owned facts; `.context/` is a PCB-compatible recovery layer and does not replace it. Source: `memory/ARCHITECTURE.md`, `memory/DECISIONS.md`.

## Development Entry Points

- Install: `npm ci`
- Runtime: Node.js 22 or later
- Build platform artifacts: `npm run build`
- Run tests: `npm test`
- Full verification: `npm run verify`
- Preview target integration: `node bin/aeos.js init --path <project> --platform <platform> --dry-run`
- Verify fixtures: `npm run test:fixtures`
- Score adherence evidence: `npm run eval:adherence -- --input <runs> --strict`
- CI: `.github/workflows/ci.yml` runs Node.js 22/24 verification and composite Action smoke tests on Linux and Windows.
