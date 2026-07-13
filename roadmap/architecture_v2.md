# AEOS 2.0 Architecture

Status: active
Version: 2.0.0-alpha.1
Last verified: 2026-07-13

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

`adapters/integrator.js` separates always-loaded entry files from on-demand knowledge. Its installation manifest records ownership and hashes so updates can distinguish AEOS-managed files from user content.

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

### 2.0 Alpha 2: Policy Quality

- Remove project-specific examples and universal architecture mandates from shared standards.
- Add explicit applicability, exceptions, and evidence to detailed standards.
- Add editor validation examples based on the published JSON Schemas.

### 2.0 Alpha 3: Workflow Packs

- Convert development, review, incident, and specification flows into optional Skills or Commands.
- Add workflow state artifacts with clear entry, exit, and approval conditions.
- Support lean and full workflow profiles based on task risk.

### 2.0 Beta: Evaluation

- Add golden fixture repositories for multiple stacks.
- Measure instruction adherence, task success, context cost, false blocking, and regression rate.
- Add `aeos doctor`, `aeos diff`, `aeos update`, and `aeos eject` lifecycle commands.
