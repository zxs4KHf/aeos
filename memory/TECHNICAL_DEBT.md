# AEOS Technical Debt

Last reviewed: 2026-07-13

| ID | Evidence | Impact | Next action | Status |
| --- | --- | --- | --- | --- |
| DEBT-002 | Workflows are Markdown guidance only | Agents cannot invoke or verify workflow state mechanically | Package lean/full workflows as Skills or Commands | open |
| DEBT-003 | Integrator has init/update safety but no doctor or eject command | Lifecycle management is incomplete | Add `doctor`, `diff`, and `eject` subcommands | open |
| DEBT-005 | No golden repository or Agent evaluation harness exists | Rule effectiveness is not yet measured | Build stack fixtures and adherence metrics | open |
| DEBT-006 | Historical v0.1 documents contain unimplemented Artifact sync design | Readers may confuse history with current behavior | Keep archive warnings and migrate useful requirements | mitigating |
| DEBT-007 | Installing every native entry can cause duplicate instructions in clients that also read `AGENTS.md` | Wasted context when users select `--platform all` | Add platform capability negotiation and compatibility-pointer rendering | open |

## Resolved

| ID | Resolution | Date |
| --- | --- | --- |
| DEBT-004 | Published JSON Schemas for policy and adapter configuration under `schemas/` | 2026-07-13 |
| DEBT-001 | Removed Bot-specific assumptions and universal architecture mandates from shared standards and workflows | 2026-07-13 |
