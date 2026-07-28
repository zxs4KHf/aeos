# AEOS Requirements

- Last verified: 2026-07-28
- Sources: code, tests, README, architecture documents, Git history, and explicit user requests in this task.

| ID | Status | Evidence | Requirement | Primary source |
| --- | --- | --- | --- | --- |
| REQ-001 | Implemented | [VERIFIED] | Maintain a platform-neutral engineering policy source and generate concise native instruction entries. | `policies/core.json`, `adapters/compiler.js`, `test/compiler.test.js` |
| REQ-002 | Implemented | [VERIFIED] | Support Codex, Cursor, Claude, Cline, Copilot, Gemini, Antigravity, and ChatGPT/API output targets. | `adapters/config.json`, `test/compiler.test.js` |
| REQ-003 | Implemented | [VERIFIED] | Install AEOS into target repositories without silently overwriting unmanaged files. | `adapters/integrator.js`, `test/integrator.test.js` |
| REQ-004 | Implemented | [VERIFIED] | Keep detailed standards and workflows out of always-loaded prompt context. | `README.md`, `adapters/compiler.js` |
| REQ-005 | Implemented | [VERIFIED] | Provide a repository-local, evidence-backed recovery context protocol. | User invoked `$pcb` on 2026-07-18; `.agents/skills/project-bootstrap/SKILL.md`; `.context/` |
| REQ-006 | In progress | [VERIFIED] | Support GitHub onboarding while preserving review and rollback. CLI, hardened composite Action, real repository templates, scoped npm identity, and prepack gate are implemented; authorized npm publishing and Marketplace release remain. | `bin/aeos.js`, `action.yml`, `templates/github/`, `package.json` |
| REQ-007 | Implemented | [VERIFIED] | Convert AEOS workflows into executable commands where platforms support repo-level commands (Claude Code `.claude/commands/aeos-*`); other platforms tracked as DEBT-013. | `adapters/integrator.js`, `test/integrator.test.js` |
| REQ-008 | In progress | [VERIFIED] | Measure policy adherence, task success, context cost, false blocking, and regression rate. Context-cost, neutral evidence schema, automated A/B scorer, and 3 fixtures/15 tasks are implemented; real Agent runs remain. | `eval/`, `test/eval.test.js` |
| REQ-011 | Implemented | [VERIFIED] | Import existing agent instruction files verbatim into `.aeos/IMPORTED.md` with entry linkage; originals preserved, idempotent, AEOS output skipped. | `aeos import`; `adapters/integrator.js`, `test/integrator.test.js`, `test/cli.test.js` |
| REQ-012 | Implemented | [VERIFIED] | Render scoped policies to platform mechanisms via `appliesTo` globs (Cursor auto-attached rules, Copilot `applyTo`). | `adapters/compiler.js`, `policies/core.json`, `test/integrator.test.js` |
| REQ-009 | Implemented | [VERIFIED] | Provide install lifecycle management: doctor, diff, eject, and orphan-pruning update. | `adapters/integrator.js`, `test/integrator.test.js`, `test/cli.test.js` |
| REQ-010 | Implemented | [VERIFIED] | Avoid duplicate always-loaded context across clients via a canonical `AGENTS.md` and pointer entries. | `adapters/config.json`, `adapters/compiler.js`, `test/integrator.test.js` |
| REQ-013 | Implemented | [VERIFIED] | Reject malformed install manifests, symbolic-link backup traversal, workspace real-path escapes, unsafe YAML metadata, and silently ignored CLI flags. | `adapters/compiler.js`, `adapters/integrator.js`, `action.yml`, `test/` |
