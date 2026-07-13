# AEOS Decision Index

Last verified: 2026-07-13

| ID | Decision | Status | Date |
| --- | --- | --- | --- |
| ADR-001 | Use a structured, platform-neutral core policy with stable IDs | accepted | 2026-07-13 |
| ADR-002 | Keep native platform entry files concise and load detailed knowledge on demand | accepted | 2026-07-13 |
| ADR-003 | Treat host permissions as authoritative; AEOS risk policy is advisory | accepted | 2026-07-13 |
| ADR-004 | Track installed-file ownership and refuse unsafe overwrites by default | accepted | 2026-07-13 |
| ADR-005 | Use Node.js standard library and built-in tests for the 2.0 alpha core | accepted | 2026-07-13 |

## Consequences

- Platform integrations may render different syntax while preserving policy IDs and meaning.
- Detailed standards cannot be assumed to be loaded for every task.
- Runtime enforcement requires platform permissions or hooks and is outside the current core.
- Installer updates are safe by default but require `--force` when user changes conflict with managed output.
