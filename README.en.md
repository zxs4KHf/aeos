# AI Engineering OS (AEOS)

AEOS is an engineering-policy compiler and workflow toolkit for AI coding agents. It maintains platform-neutral engineering rules as a structured, machine-validated policy source and renders native entry files for Codex, Cursor, Claude Code, Cline, GitHub Copilot, Gemini, Antigravity, and API agents.

Current version: `2.0.0-alpha.4` · 中文文档: [README.md](README.md)

> AEOS is a governance and context layer, not an agent runtime. It never bypasses or replaces the host platform's sandbox, permissions, or approval controls.

## Why AEOS

Rule-syncing tools distribute the same Markdown to every client. AEOS goes further:

- **Structured policy, not prose.** Every rule has a stable ID, a `required`/`recommended` level, a scope, a rationale, an evidence requirement, and a traceable source document — validated by JSON Schema on every build.
- **Context budgets.** Always-loaded entries are gated by line and token budgets, so guidance never grows into a mega-prompt. Detailed standards install to `.aeos/knowledge/` and load on demand.
- **Deduplicated context.** `AGENTS.md` is the canonical entry; clients that read it natively (Cursor, Copilot, Claude Code) get an 8-line pointer instead of a duplicate body.
- **Safe lifecycle.** Installs are recorded in a hash manifest. `update` refreshes managed files and prunes orphans, `doctor` diagnoses drift, `diff` previews changes, `eject` uninstalls cleanly — user-modified files are never silently overwritten.
- **Deterministic artifacts.** Generated output is hashed, committed, and drift-checked in CI on Linux and Windows.

## Quick Start

Requires Node.js 20+.

```bash
npm ci
npm run verify        # tests + generated-output drift check
```

Install into a target project:

```bash
node bin/aeos.js init --path /path/to/project --platform cursor --dry-run   # preview
node bin/aeos.js init --path /path/to/project --platform cursor            # install
```

## CLI

```text
aeos build                     Render native platform entries into dist/
aeos check                     Verify committed artifacts match the policy source
aeos init   --path <dir> --platform <name>|all [--dry-run] [--force] [--no-knowledge]
aeos import --path <dir>       Collect pre-existing agent instructions into .aeos/IMPORTED.md
aeos update --path <dir>       Refresh installed platforms and prune orphans
aeos doctor --path <dir>       Diagnose managed files [--json] [--strict for CI]
aeos diff   --path <dir>       Preview what update would change [--json]
aeos eject  --path <dir>       Uninstall; keeps .aeos/ project facts
```

Migrating an existing project? Run `aeos import` first: it preserves your current CLAUDE.md/.cursorrules/copilot instructions verbatim in `.aeos/IMPORTED.md` (originals untouched, AEOS-generated files skipped, idempotent), and entries link it in their knowledge map. Policies with `appliesTo` globs additionally render as Cursor auto-attached rules and Copilot `applyTo` instructions; `workflows/` compile into Claude Code slash commands (`/aeos-development`, `/aeos-incident-response`, `/aeos-review-sync`).

## GitHub Action

Use the bundled composite action to onboard or refresh a repository from CI:

```yaml
- uses: <owner>/aeos@main
  with:
    platform: codex     # or cursor, claude, all, ...
    mode: init          # or update
```

Pair it with a PR-creating action for reviewable onboarding; see `templates/github/aeos-onboard-workflow.yml`.

## Evaluation

`npm run eval` reports the context cost of every platform entry (lines, estimated tokens, pointer savings) and the on-demand knowledge pack. The adherence-testing protocol for measuring whether policies actually change agent behavior lives in `eval/ADHERENCE_PROTOCOL.md`.

## Editing Policy

Core always-loaded rules live in `policies/core.json`; each policy carries `id`, `level`, `scope`, `statement`, `rationale`, `evidence`, and `source`. Detailed guidance belongs in `standards/` and `workflows/`. After editing:

```bash
npm run build && npm run verify
```

## Publishing Status

The package is still `private: true`. Before publishing to npm: verify the package name (a scoped name such as `@<owner>/aeos` is the safe default) and review the LICENSE (MIT by default — swap if you prefer another license).

## License

[MIT](LICENSE)
