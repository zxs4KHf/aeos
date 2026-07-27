# AEOS Decision Index

Last verified: 2026-07-26

| ID | Decision | Status | Date |
| --- | --- | --- | --- |
| ADR-001 | Use a structured, platform-neutral core policy with stable IDs | accepted | 2026-07-13 |
| ADR-002 | Keep native platform entry files concise and load detailed knowledge on demand | accepted | 2026-07-13 |
| ADR-003 | Treat host permissions as authoritative; AEOS risk policy is advisory | accepted | 2026-07-13 |
| ADR-004 | Track installed-file ownership and refuse unsafe overwrites by default | accepted | 2026-07-13 |
| ADR-005 | Use Node.js standard library and built-in tests for the 2.0 alpha core | accepted | 2026-07-13 |
| ADR-006 | Adopt Project Context Bootstrap as an optional repository-local continuity protocol | accepted | 2026-07-18 |
| ADR-007 | Onboard new repositories through an npm CLI first; GitHub Action and templates wrap the CLI | accepted | 2026-07-26 |
| ADR-008 | Treat `AGENTS.md` as the canonical entry; AGENTS.md-aware platforms install pointer entries | accepted | 2026-07-26 |
| ADR-009 | MCP server/credential configuration propagation is a non-goal; AEOS stays a policy layer | accepted | 2026-07-26 |
| ADR-010 | License under MIT by default; the maintainer may swap it before publishing | accepted | 2026-07-26 |
| ADR-011 | Import preserves pre-existing instructions verbatim in `.aeos/IMPORTED.md`; no automatic prose-to-policy conversion | accepted | 2026-07-26 |
| ADR-012 | Scoped platform rules derive from explicit `appliesTo` globs on policies, not from inferred semantic scopes | accepted | 2026-07-26 |

## Consequences

- Platform integrations may render different syntax while preserving policy IDs and meaning.
- Detailed standards cannot be assumed to be loaded for every task.
- Runtime enforcement requires platform permissions or hooks and is outside the current core.
- Installer updates are safe by default but require `--force` when user changes conflict with managed output.
- `.context/` provides fast recovery and requirement state; `memory/` remains AEOS-owned architecture and product knowledge.
- Distribution work (Action, templates) must not bypass the CLI's safety and manifest semantics.
- Pointer entries depend on the canonical `AGENTS.md` being installed; single-platform installs still render full bodies.
