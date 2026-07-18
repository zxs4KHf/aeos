# AEOS Decision Index

- Last verified: 2026-07-18
- Authority: explicit user requests and accepted AEOS decisions are authoritative; historical v0.1 design documents are not.

| Decision | Status | Consequence | Source | Reconsider when |
| --- | --- | --- | --- | --- |
| DEC-001 | Accepted | Core rules use stable IDs and a platform-neutral structured source. | `memory/DECISIONS.md` ADR-001; `policies/core.json` | A richer policy format materially improves tooling without losing portability. |
| DEC-002 | Accepted | Native entry files stay short; detailed guidance loads on demand. | `memory/DECISIONS.md` ADR-002; `README.md` | Measured task success favors a larger always-loaded context. |
| DEC-003 | Accepted | AEOS risk policy is advisory; host permissions remain authoritative. | `memory/DECISIONS.md` ADR-003; `constitution/constitution.md` | AEOS becomes an actual runtime or permission broker. |
| DEC-004 | Accepted | The installer records ownership and refuses unmanaged overwrites by default. | `memory/DECISIONS.md` ADR-004; `adapters/integrator.js` | A stronger transactional installer replaces the current manifest model. |
| DEC-005 | Accepted | The alpha core uses only Node.js standard library and built-in tests. | `memory/DECISIONS.md` ADR-005; `package.json` | A dependency removes material complexity or improves correctness enough to justify its cost. |
| DEC-006 | Accepted | PCB supplies `.context/` for fast recovery while AEOS `memory/` remains the AEOS-owned fact layer. | User invoked `$pcb` on 2026-07-18; `memory/DECISIONS.md` ADR-006 | The two context systems prove duplicative in real project use. |

Do not promote candidate GitHub onboarding designs to accepted decisions without user confirmation and implementation evidence.
