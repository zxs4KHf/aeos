# Current State

- Last verified: 2026-07-27
- Branch: `codex/recover-claude-alpha4`
- Feature commit: `2eab7be` (`feat: recover AEOS 2.0 alpha.4 lifecycle and onboarding`)
- Base: `6171b9b`, identical to `origin/main` when recovery began.
- Worktree: expected clean after this handoff update is committed.
- Current phase: Claude's interrupted alpha.2-alpha.4 work has been reviewed, repaired, verified, and isolated from `main`. It is ready for remote CI and user validation, not yet for merge.

## Working

- `[VERIFIED]` Unified `aeos` CLI supports build, check, init, import, update, doctor, diff, and eject.
- `[VERIFIED]` Install/update/eject lifecycle tracks ownership, prunes clean orphans, preserves modified files, and retains a retry manifest when non-force eject cannot remove modified managed files.
- `[VERIFIED]` `AGENTS.md` is canonical for multi-platform installs; compatible clients receive short pointers, reducing estimated all-platform entry context from 5142 to 3477 tokens.
- `[VERIFIED]` Existing repository instructions can be imported verbatim into `.aeos/IMPORTED.md`; scoped Cursor/Copilot rules and Claude Code workflow commands are generated and lifecycle-managed.
- `[VERIFIED]` GitHub onboarding includes a composite Action and workflow templates. Strict doctor mode fails on pending updates, Action inputs are passed through environment variables, target paths are constrained to `GITHUB_WORKSPACE`, and CI covers Linux and Windows.
- `[VERIFIED]` npm package contents, MIT license, English README, schemas, evaluation tooling, roadmap, and changelog are present in feature commit `2eab7be`.

## Review Repairs

- Incremental installs now refresh stale full entries to canonical pointers when expected content or kind changes.
- Non-force eject now preserves enough manifest state for a later `eject --force` retry.
- GitHub verification now treats `updatesPending=true` as failure through `doctor --strict`.
- CI now runs on both Ubuntu and Windows.
- Composite Action inputs are no longer directly interpolated into Bash, and target paths cannot escape the workspace.

## Broken, Blocked, or Uncertain

- `[PENDING REMOTE CHECK]` GitHub Actions must confirm the Linux and Windows jobs on the pushed recovery branch.
- `[PENDING USER VALIDATION]` The user wants to inspect and test this branch before anything is merged into `main`.
- `[RELEASE HARDENING]` GitHub templates still contain `<owner>/aeos@main`; third-party Actions use version tags rather than pinned commit SHAs.
- `[RELEASE HARDENING]` The npm package name is unverified and `private` remains `true`; publishing is intentionally not part of this recovery.
- `[DOCUMENTED]` Automated adherence scoring and fixture repositories remain future beta work; only context-cost evaluation and the A/B protocol exist now.

## Verification Performed

- `npm run verify`: 35 tests passed and generated artifacts for 8 platforms matched on Windows, 2026-07-27.
- `npm run eval -- --json`: 5142 full-entry tokens, 3477 with canonical pointers, estimated savings 1665 tokens.
- `npm pack --dry-run --json`: package preview succeeded with 51 files.
- `git diff --check`: passed before the feature commit.
- Not yet run: remote GitHub Actions on Linux and Windows.

## Next Three Actions

1. Push `codex/recover-claude-alpha4` and confirm both GitHub Actions matrix jobs pass.
2. Let the user inspect and validate the recovery branch; address any findings on the same branch.
3. After explicit user approval, fetch `origin/main`, re-check drift, and merge through a reviewed pull request. Do not merge automatically.

## Resume From Here

Start with `git status --short --branch` and the GitHub Actions result for `codex/recover-claude-alpha4`. If both jobs are green, report the branch and commit to the user for validation; do not merge into `main` without explicit approval.
