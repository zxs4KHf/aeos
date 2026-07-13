# AEOS Lessons Learned

Last reviewed: 2026-07-13

## Keep the Entry Small

A single generated instruction file grew to more than 500 lines. Large always-loaded prompts consume task context and make every rule appear equally important. AEOS 2.0 uses a short entry plus an on-demand knowledge map.

Evidence: legacy `dist/AGENTS.md` replaced by budget-checked platform entries.

## Separate Design from Implemented Capability

The 1.0 documentation described Artifact synchronization, metrics, and permission behavior that had no executable implementation. Current documentation must clearly distinguish active, planned, and historical behavior.

Evidence: `README.md`, `roadmap/architecture_v2.md`, and archive notices.

## Project Memory Must Contain Project Facts

Generic templates and facts from another bot project were stored as AEOS memory. Memory is now reserved for verified AEOS facts; reusable blank forms live under `templates/memory/`.

## Installation Needs Ownership

Copying generated rules without a manifest cannot distinguish a safe update from overwriting user content. The 2.0 installer records hashes, refuses conflicts, and backs up forced replacements.
