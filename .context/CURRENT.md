# Current State

- Last verified: 2026-07-28
- Branch: `codex/recover-claude-alpha4`
- Alpha.5 feature commit: `ffc9159` (`feat: harden alpha.5 release and add adherence evaluation`)
- Recovery base: `6171b9b`, identical to `origin/main` after fetch on 2026-07-28.
- Worktree: expected clean after this handoff update is committed.
- Current phase: `2.0.0-alpha.5` is implemented and verified locally and in GitHub's six-job cross-platform matrix. The recovery branch includes release hardening, adherence evaluation v1, and transactional lifecycle safety. User validation is still required; nothing has been merged to `main`.

## Working

- `[VERIFIED]` Public-ready package metadata uses `@zxs4khf/aeos`, Node.js `>=22`, a public publish configuration, and a `prepack` verification gate. Actual npm publication remains explicitly authorized.
- `[VERIFIED]` GitHub Actions are pinned to immutable SHAs. CI covers Node.js 22/24 on Ubuntu/Windows and invokes the local composite Action in a separate Ubuntu/Windows smoke matrix.
- `[VERIFIED]` The composite Action validates boolean inputs and constrains both lexical and real target paths to `GITHUB_WORKSPACE`.
- `[VERIFIED]` Compiler validation covers renderer, aliases, portable target collisions, policy IDs/metadata, knowledge uniqueness, glob controls, and quoted scoped-rule frontmatter.
- `[VERIFIED]` Installer manifests are validated before use; backup paths reject symbolic-link traversal; temporary writes use randomized exclusive files.
- `[VERIFIED]` Install/update/eject managed mutations are transactional as a set. Injected manifest write/removal failures restore files and leave `doctor` healthy.
- `[VERIFIED]` Adherence evaluation v1 includes an Agent-neutral run schema, A/B scorer, strict gates, three runnable fixtures, and 15 policy-focused tasks. Synthetic evidence validates the scorer but is not product-effect evidence.

## Verification Performed

- `npm run verify`: 43 tests passed, all three fixtures passed their baseline checks, and generated artifacts for 8 platforms matched on Windows, 2026-07-28.
- `npm run eval -- --json`: 5142 full-entry tokens, 3477 with canonical pointers, estimated savings 1665 tokens.
- `npm run eval:adherence -- --input eval/examples/synthetic-runs.json --json --strict`: gates passed; output uses relative source paths.
- `npm pack --dry-run --json`: prepack gate passed; package contains 82 files, 72,564 compressed bytes, 225,783 unpacked bytes.
- `npm audit --omit=dev`: zero vulnerabilities.
- Node syntax checks and `git diff --check`: passed.
- GitHub Actions run `30373695183`: Node.js 22/24 verification passed on Ubuntu and Windows; composite Action smoke tests passed on Ubuntu and Windows.

## Broken, Blocked, or Uncertain

- `[PENDING USER VALIDATION]` The branch must be inspected and tested before a pull request is merged.
- `[EXTERNAL AUTHORIZATION]` npm is not authenticated on this machine; do not publish until the maintainer confirms ownership of the `@zxs4khf` scope and explicitly authorizes release.
- `[EVIDENCE GAP]` No real Codex/Claude A/B matrix has been run. The next evaluation milestone is transcript normalization plus at least three runs per task/group cell.
- `[RELEASE ORDERING]` Consumer templates reference `zxs4KHf/aeos@main`; they become usable after the Action reaches `main`, and should move to a release tag or immutable release SHA before Marketplace publication.

## Next Three Actions

1. Let the user inspect the full `main...codex/recover-claude-alpha4` diff and test alpha.5.
2. Address any user findings on this branch and rerun the complete local/remote matrix.
3. After explicit user approval, create a reviewed pull request and merge. npm/Marketplace publication is a separate explicitly authorized release task.

## Resume From Here

Start with `git status --short --branch` and GitHub Actions run `30373695183`. The exact feature checkpoint is `ffc9159`; all six remote jobs are green. Help the user validate the branch. Do not publish npm packages or merge `main` without explicit user approval.
