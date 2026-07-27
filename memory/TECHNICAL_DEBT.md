# AEOS Technical Debt

Last reviewed: 2026-07-26

| ID | Evidence | Impact | Next action | Status |
| --- | --- | --- | --- | --- |
| DEBT-005 | No golden repository or automated adherence harness exists (protocol only) | Rule effectiveness is not yet measured | Build stack fixtures and automate the adherence protocol | open |
| DEBT-006 | Historical v0.1 documents contain unimplemented Artifact sync design | Readers may confuse history with current behavior | Keep archive warnings and migrate useful requirements | mitigating |
| DEBT-010 | npm package name unverified (registry unreachable from the workspace; an `aeos` npm username exists) | Blocks flipping `private` and publishing | Verify the name from a networked machine or adopt a scoped name `@<owner>/aeos` | open (narrowed 2026-07-26) |
| DEBT-013 | Workflow commands ship for Claude Code only | Codex custom prompts are user-global and Cursor lacks repo commands, so other clients rely on on-demand knowledge | Revisit when platforms add repo-scoped command mechanisms | open (accepted) |

## Resolved

| ID | Resolution | Date |
| --- | --- | --- |
| DEBT-011 | `aeos import` collects existing agent instructions into `.aeos/IMPORTED.md`; entries link it in the knowledge map | 2026-07-26 |
| DEBT-012 | `appliesTo` globs render as Cursor auto-attached rules and Copilot `applyTo` instructions | 2026-07-26 |
| DEBT-002 | Workflows compile into Claude Code repo commands (`.claude/commands/aeos-*`); remaining platforms tracked as DEBT-013 | 2026-07-26 |
| DEBT-008 | Mirror rendering is now data-driven via install/repository path contexts in the compiler | 2026-07-26 |
| DEBT-009 | Added `maxEntryTokens` budget gate and per-entry token estimates in the manifest | 2026-07-26 |
| DEBT-003 | Added `doctor`, `diff`, `eject`, and orphan-pruning `update` via `bin/aeos.js` and the integrator | 2026-07-26 |
| DEBT-007 | Added `canonical`/`readsAgentsMd` capability flags; AGENTS.md-aware platforms render pointer entries instead of duplicate bodies | 2026-07-26 |
| DEBT-004 | Published JSON Schemas for policy and adapter configuration under `schemas/` | 2026-07-13 |
| DEBT-001 | Removed Bot-specific assumptions and universal architecture mandates from shared standards and workflows | 2026-07-13 |
