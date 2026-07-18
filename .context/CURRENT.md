# Current State

- Last verified: 2026-07-18
- Branch: `main`
- Commit: `HEAD` (PCB onboarding commit)
- Worktree: expected clean after the PCB onboarding commit is synchronized.
- Current phase: Project Context Bootstrap onboarding complete; next product milestone is unselected.

## Working

- `[VERIFIED]` The 2.0 alpha compiler renders 8 native platform entries and enforces a 120-line entry budget. Source: `adapters/config.json`, `test/compiler.test.js`.
- `[VERIFIED]` The integrator supports dry runs, target-path containment, managed-file updates, conflict refusal, forced backups, and incremental platform ownership. Source: `test/integrator.test.js`.
- `[VERIFIED]` `npm run verify` previously passed 16 tests and the generated-output drift check at commit `676cfbc`. Source: commit `676cfbc`, `package.json`.
- `[VERIFIED]` PCB skills are installed under `.agents/skills/` and `.claude/skills/`; this context layer is now being materialized. Source: current worktree.

## Broken, Blocked, or Uncertain

- `[CANDIDATE]` GitHub page-based onboarding has not been designed or implemented. The proposed model is a manually dispatched GitHub Action that opens a target-repository PR.
- `[UNKNOWN]` The remote GitHub CI result for commit `676cfbc` has not been inspected from this workspace.
- `[DOCUMENTED]` Workflow packs remain Markdown guidance rather than executable Skills or Commands. Source: `memory/TECHNICAL_DEBT.md`.

## Verification Performed

- `npm run verify` passed 16 tests and the generated-output drift check on 2026-07-18.
- PCB registry resolution validated alias `pcb`, manifest identity `project-context-bootstrap`, and registered README on 2026-07-18.
- The PCB connector installed project Skills without scaffolding or overwriting existing agent instructions on 2026-07-18.

## Next Three Actions

1. Decide whether GitHub onboarding should be a reusable Action that opens a PR, a repository template, or a published CLI.
2. Implement the selected GitHub onboarding path with an end-to-end fixture repository.
3. Add `doctor`, `diff`, and `eject` lifecycle commands to the AEOS integrator.

## Resume From Here

Read `.context/CURRENT.md`, inspect `git status`, then ask the user to choose the GitHub onboarding model before implementing it. The recommended default is a reusable GitHub Action that creates a reviewable PR.
