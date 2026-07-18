# AEOS Requirements

- Last verified: 2026-07-18
- Sources: code, tests, README, architecture documents, Git history, and explicit user requests in this task.

| ID | Status | Evidence | Requirement | Primary source |
| --- | --- | --- | --- | --- |
| REQ-001 | Implemented | [VERIFIED] | Maintain a platform-neutral engineering policy source and generate concise native instruction entries. | `policies/core.json`, `adapters/compiler.js`, `test/compiler.test.js` |
| REQ-002 | Implemented | [VERIFIED] | Support Codex, Cursor, Claude, Cline, Copilot, Gemini, Antigravity, and ChatGPT/API output targets. | `adapters/config.json`, `test/compiler.test.js` |
| REQ-003 | Implemented | [VERIFIED] | Install AEOS into target repositories without silently overwriting unmanaged files. | `adapters/integrator.js`, `test/integrator.test.js` |
| REQ-004 | Implemented | [VERIFIED] | Keep detailed standards and workflows out of always-loaded prompt context. | `README.md`, `adapters/compiler.js` |
| REQ-005 | Implemented | [VERIFIED] | Provide a repository-local, evidence-backed recovery context protocol. | User invoked `$pcb` on 2026-07-18; `.agents/skills/project-bootstrap/SKILL.md`; `.context/` |
| REQ-006 | Candidate | [DOCUMENTED] | Support GitHub page-based onboarding of new repositories while preserving review and rollback. | User request on 2026-07-13; `.context/CURRENT.md` |
| REQ-007 | Candidate | [DOCUMENTED] | Convert selected AEOS workflows into optional executable Skills or Commands. | `roadmap/architecture_v2.md`, `memory/TECHNICAL_DEBT.md` |
| REQ-008 | Deferred | [DOCUMENTED] | Add golden repositories and measure policy adherence, task success, context cost, false blocking, and regression rate. | `roadmap/architecture_v2.md` |
