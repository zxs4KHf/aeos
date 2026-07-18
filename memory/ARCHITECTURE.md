# AEOS Architecture

Status: active
Last verified: 2026-07-13
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
- `adapters/compiler.js` validates and renders deterministic output.
- `adapters/integrator.js` owns safe deployment and installation manifests.
- `templates/memory/` initializes project-specific facts without overwriting them later.
- `test/` verifies compiler and installer invariants.
- `.context/` is the PCB-compatible one-minute recovery layer; it complements `memory/` and does not replace it.

## Persistence

AEOS uses files only. Generated hashes live in `dist/manifest.json`; target-project ownership hashes live in `.aeos/install-manifest.json`.

## Security Boundary

AEOS policy never expands runtime permissions. The host Agent, IDE, sandbox, operating system, and user approval remain authoritative.
