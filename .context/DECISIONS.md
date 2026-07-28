# AEOS Decision Index

- Last verified: 2026-07-28
- Authority: explicit user requests and accepted AEOS decisions are authoritative; historical v0.1 design documents are not.

| Decision | Status | Consequence | Source | Reconsider when |
| --- | --- | --- | --- | --- |
| DEC-001 | Accepted | Core rules use stable IDs and a platform-neutral structured source. | `memory/DECISIONS.md` ADR-001; `policies/core.json` | A richer policy format materially improves tooling without losing portability. |
| DEC-002 | Accepted | Native entry files stay short; detailed guidance loads on demand. | `memory/DECISIONS.md` ADR-002; `README.md` | Measured task success favors a larger always-loaded context. |
| DEC-003 | Accepted | AEOS risk policy is advisory; host permissions remain authoritative. | `memory/DECISIONS.md` ADR-003; `constitution/constitution.md` | AEOS becomes an actual runtime or permission broker. |
| DEC-004 | Accepted | The installer records ownership and refuses unmanaged overwrites by default. | `memory/DECISIONS.md` ADR-004; `adapters/integrator.js` | A stronger transactional installer replaces the current manifest model. |
| DEC-005 | Accepted | The alpha core uses only Node.js standard library and built-in tests. | `memory/DECISIONS.md` ADR-005; `package.json` | A dependency removes material complexity or improves correctness enough to justify its cost. |
| DEC-006 | Accepted | PCB supplies `.context/` for fast recovery while AEOS `memory/` remains the AEOS-owned fact layer. | User invoked `$pcb` on 2026-07-18; `memory/DECISIONS.md` ADR-006 | The two context systems prove duplicative in real project use. |
| DEC-007 | Accepted | GitHub onboarding is CLI-first: `bin/aeos.js` is the npm entry point; the GitHub Action and templates wrap it. | User selection on 2026-07-26; `memory/DECISIONS.md` ADR-007 | The Action needs behavior the CLI cannot express. |
| DEC-008 | Accepted | `AGENTS.md` is the canonical entry; AGENTS.md-aware platforms install short pointer entries instead of duplicate bodies. | User selection on 2026-07-26; `memory/DECISIONS.md` ADR-008; `adapters/config.json` | A major client stops reading `AGENTS.md`, or pointer entries measurably reduce adherence. |
| DEC-009 | Accepted | MCP server/credential propagation is a non-goal; tool access stays with the host and user. | Design review 2026-07-26; `roadmap/design_2026-07.md` §5-6 | Users repeatedly ask for it and the policy boundary can be preserved. |
| DEC-010 | Accepted | Default license is MIT ("AEOS contributors"); maintainer may swap before npm publishing. | User mandate "随便怎么迭代" on 2026-07-26; `LICENSE` | The maintainer chooses a different license. |
| DEC-011 | Accepted | `aeos import` preserves existing instructions verbatim (no mechanical prose-to-policy conversion); entries link `.aeos/IMPORTED.md`. | User mandate for autonomous best choices on 2026-07-26; `memory/DECISIONS.md` ADR-011 | An LLM-assisted structured import proves reliable. |
| DEC-012 | Accepted | Scoped rules come from explicit `appliesTo` globs (first: DEPS-001, DOCS-001) rendered for Cursor and Copilot. | Same mandate; `memory/DECISIONS.md` ADR-012; `policies/core.json` | Semantic-scope inference or more platforms with scoped mechanisms. |
| DEC-013 | Accepted | Public npm identity is `@zxs4khf/aeos`; publishing still requires explicit npm authorization. | `memory/DECISIONS.md` ADR-013; `package.json` | Repository ownership or npm scope ownership changes. |
| DEC-014 | Accepted | Minimum runtime is Node.js 22; CI covers Node.js 22 and 24 on Linux and Windows. | `memory/DECISIONS.md` ADR-014; `.github/workflows/ci.yml` | The supported Node.js release schedule changes. |
| DEC-015 | Accepted | Adherence scoring consumes a versioned Agent-neutral evidence schema. | `memory/DECISIONS.md` ADR-015; `eval/run.schema.json` | A shared upstream transcript standard becomes viable. |
