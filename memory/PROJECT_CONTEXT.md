# AEOS Project Context

Status: active
Last verified: 2026-07-13
Owner: repository maintainers

## Purpose

AEOS is an agent-agnostic engineering policy compiler and optional workflow toolkit. It generates concise native instruction entry files and installs detailed guidance for on-demand use.

## Users

- Individual developers who switch between AI coding agents.
- Teams that want versioned, reviewable engineering guidance.
- Tool builders that need a portable system prompt or repository instruction layer.

## Technology

- Runtime: Node.js 20 or later.
- Dependencies: Node.js standard library only.
- Tests: built-in `node:test` runner.
- State: JSON and Markdown files; no database or resident process.
- Continuity protocol: Project Context Bootstrap Skills with committed `.context/` facts and local-only `.context/LOCAL.md`.

## Commands

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm test`
- Verify: `npm run verify`
- Preview integration: `node adapters/integrator.js --path <project> --platform <platform> --dry-run`

## Product Boundary

AEOS does not implement a model runtime, permission sandbox, background poller, database, or editor Artifact synchronization service.
