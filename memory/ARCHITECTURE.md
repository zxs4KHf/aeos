# AEOS Architecture

Status: active
Last verified: 2026-07-28
Source: `roadmap/architecture_v2.md`

## Data Flow

```text
policies/core.json + adapters/config.json
                  |
                  v
         adapters/compiler.js
                  |
                  v
       concise files under dist/
                  |
                  v
        adapters/integrator.js
             /           \
            v             v
  native entry file   .aeos/knowledge/
```

## Boundaries

- `policies/` owns structured, always-loaded policy.
- `constitution/`, `standards/`, `workflows/`, and `playbooks/` own human-readable guidance.
- `adapters/compiler.js` validates and renders deterministic output, including pointer entries for AGENTS.md-aware platforms.
- `adapters/integrator.js` owns safe deployment, installation manifests, and the install/update/doctor/diff/eject lifecycle.
- `bin/aeos.js` is the single CLI surface over the compiler and integrator, and the future npm entry point.
- `templates/memory/` initializes project-specific facts without overwriting them later.
- `action.yml` wraps the CLI for GitHub-based onboarding; it never bypasses integrator semantics.
- `eval/` owns effect measurement: context cost, Agent-neutral adherence scoring, and three runnable golden fixtures.
- `test/` verifies compiler and installer invariants.
- `.context/` is the PCB-compatible one-minute recovery layer; it complements `memory/` and does not replace it.

## Persistence

AEOS uses files only. Generated hashes live in `dist/manifest.json`; target-project ownership hashes live in `.aeos/install-manifest.json`. Individual writes use exclusive randomized temporary files and atomic rename; lifecycle commands snapshot the affected managed set and roll back all mutations if a later write or removal fails.

## Security Boundary

AEOS policy never expands runtime permissions. The host Agent, IDE, sandbox, operating system, and user approval remain authoritative. Target paths, install manifests, backup paths, and GitHub Action workspace paths are validated before use; symbolic-link traversal is refused at managed write boundaries.
