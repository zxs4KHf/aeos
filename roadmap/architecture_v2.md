# AEOS 2.0 Architecture

Status: active — component reference; strategy and roadmap live in `design_2026-07.md`
Version: 2.0.0-alpha.5
Last verified: 2026-07-28

## Product Boundary

AEOS 2.0 uses a stable policy compiler as its core and exposes workflows as optional packs. It does not implement a model runtime, permission sandbox, or autonomous orchestrator.

## Components

```text
Structured Policy Source
  -> Validator
  -> Context Budget Gate
  -> Platform Renderer
  -> Deterministic Artifacts
  -> Safe Integrator
  -> Target Repository
```

### Policy Source

`policies/core.json` contains the small set of rules suitable for every task. Stable IDs make rules traceable from rendered output to human-readable source documents.

### Compiler

`adapters/compiler.js` validates policy and platform configuration, renders native entry files, enforces an entry-line budget, writes files atomically, and produces deterministic hashes.

### Platform Registry

`adapters/config.json` declares aliases, renderer, build target, and install target. A platform adapter is therefore data-driven where possible and renderer-driven where syntax differs.

### Integrator

`adapters/integrator.js` separates always-loaded entry files from on-demand knowledge. Its installation manifest records ownership and hashes so updates can distinguish AEOS-managed files from user content. The lifecycle covers install, update (with orphan pruning), doctor, diff, and eject.

### CLI

`bin/aeos.js` is the single command surface over the compiler and integrator, and the planned npm entry point (`npx aeos ...`). The GitHub Action and template onboarding paths wrap this CLI rather than reimplementing installation logic.

### Canonical Entry and Pointers

`AGENTS.md` is the canonical always-loaded entry. Platforms flagged `readsAgentsMd` install a short pointer entry when the canonical entry is present, so multi-client installs do not duplicate context.

### Knowledge and Project Facts

Detailed reusable guidance is installed under `.aeos/knowledge/`. Target-specific facts live directly under `.aeos/` and are initialized once from `templates/memory/`; they are never refreshed from generic AEOS content.

## Invariants

1. Host permissions take precedence over AEOS prose.
2. Generated entry files stay within the configured line budget.
3. Missing policy sources and unknown renderers fail the build.
4. Integration never overwrites unmanaged content without `--force` and a backup.
5. Repository facts and reusable standards remain separate.
6. Generated artifacts are deterministic and checked in CI.

## Next Milestones

See `design_2026-07.md` §7 for the authoritative roadmap (alpha.4: import + scoped rendering + workflow packs; beta: adherence automation + npm publish; GA: public evidence).

### Shipped in 2.0 Alpha 3 (2026-07-26)

- Top-level design (`design_2026-07.md`): layer model, competitive positioning, capability matrix, non-goals.
- Token budget gate (`maxEntryTokens`) with per-entry estimates in the manifest.
- Data-driven install/repository mirror rendering (string-replacement hack removed).
- Distribution readiness: LICENSE (MIT), English README, composite GitHub Action, `doctor`/`diff --json`.
- Evaluation layer v0: `npm run eval` context-cost report and the adherence A/B protocol.

### Shipped in 2.0 Alpha 2 (2026-07-26)

- `bin/aeos.js` CLI with build, check, init, update, doctor, diff, and eject.
- Orphan pruning on update; safe eject that preserves project facts.
- Canonical `AGENTS.md` with pointer entries for AGENTS.md-aware platforms.
- Windows added to the CI matrix.
