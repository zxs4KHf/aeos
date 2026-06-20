# 📑 AI Engineering OS (AEOS) v0.1 Research Report

This report presents a comparative analysis of modern AI Agent architectures, classical software engineering practices, and product development workflows. Based on this research, we establish the design rationale for the **AI Engineering Operating System (AEOS)**.

---

## 1. AI Agent Architectures: Comparative Study

We analyze the state-of-the-art in autonomous coding agents, highlighting their strengths and structural limitations.

### 1.1 Claude Code & Anthropic Best Practices
- **Core Mechanism**: Utilizes a loop of terminal-based tool execution (read/write files, run commands, grep, directory analysis). Runs directly in a CLI-driven loop.
- **Strengths**: High-performance multi-step reasoning, fast iterative tool execution, and local sandbox verification.
- **Anthropic Best Practices**: Emphasizes strict verification checks (running tests after changes), incremental directory scanning, and writing concise, self-contained scripts rather than long command strings.

### 1.2 Devin (Cognition) & OpenHands (All-Hands)
- **Devin**: Integrates plan breakdown, progress monitoring, terminal feedback checking, and visual web testing. It acts as an autonomous team member.
- **OpenHands**: An open-source counterpart utilizing sandbox environments (Docker containers) and a structured event stream to coordinate file and command tools.
- **Key Takeaway**: A visual, structured TODO tracker and sandboxed environment prevent agents from causing uncontrolled damage to the host system.

### 1.3 Cursor Rules, Roo Code & Cline
- **Core Mechanism**: Lightweight, file-level rules (`.cursorrules`, `.clinerules`) loaded into the agent's system prompt based on active paths.
- **Strengths**: Zero configuration, instant contextual awareness, low token overhead.
- **Limitations**: Strongly bound to specific IDEs (Cursor/VS Code) and lack cross-agent compatibility.

### 1.4 Orchestration Frameworks: LangGraph, CrewAI, AutoGen
- **Core Mechanism**: State machine-based workflow routing, multi-agent role division, and message bus queues.
- **Strengths**: Excellent for complex multi-step decision processes and division of labor (e.g., separating research from coding).
- **Key Takeaway**: Separation of concerns between a coordinator (Planner) and implementers (Subagents) vastly increases success rates.

---

## 2. Software Engineering Methodologies

Classical engineering principles provide the structural guardrails for AEOS.

### 2.1 Google Engineering Practices
- **Rules**: Small Change Lists (CLs) with single responsibilities, clear documentation before coding, writing comprehensive unit and integration tests, and strict review checklists.
- **Application in AEOS**: Encouraging incremental changes with automated verification after each tool execution block.

### 2.2 Amazon Working Backwards
- **Mechanism**: Writing the Press Release (PR) and FAQ *before* writing a single line of code.
- **Application in AEOS**: Forcing the agent to write a clear PRD and Implementation Plan first, obtaining user sign-off before coding.

### 2.3 Architecture Decision Records (ADR)
- **Mechanism**: Documenting a design decision, its context, alternatives, and consequences in a lightweight Markdown file.
- **Application in AEOS**: Standardizing a `decisions/` directory inside AEOS Memory to log all architectural pivots.

### 2.4 DDD, SOLID & Hexagonal Architecture
- **Hexagonal (Ports & Adapters)**: Isolating the core application logic from external inputs/outputs (databases, UI, APIs) via interfaces.
- **Application in AEOS**: Core AEOS specifications are platform-agnostic. Specific agents (Antigravity, Claude Code) are treated as **Adapters** that implement the interface to load AEOS rules.

---

## 3. Product R&D Workflows

We define the stages of product lifecycle management that AEOS must enforce.

| Phase | Artifact | Purpose | AEOS Mapping |
| :--- | :--- | :--- | :--- |
| **Ideation** | PRD / Vision | Define problem, scope, metrics, and L0-L7 approval levels | `roadmap/PRD_v0.1.md` |
| **Design** | Architecture / RFC | Technical blueprint and public征求意见 | `roadmap/architecture_v0.1.md` |
| **Planning** | Task Breakdown | Split goals into small TODOs | `templates/task.md` |
| **Execution** | Code / Git Flow | Incremental development following branches | `standards/git.md` |
| **Verification** | QA / Test Plan | Automated & manual check policies | `standards/testing.md` |
| **Release** | Release Note / Changelog | Version tagging and user-facing delta summary | `releases/` & `changelog/` |
| **Reflection** | Postmortem | Root cause analysis of major failures | `templates/postmortem.md` |

---

## 4. Rationale: The AEOS Design Paradigm

Based on the above comparison, AEOS rejects the approach of "writing a long prompt for a specific bot." Instead, it is designed as a **decoupled operating system**:

```text
┌─────────────────────────────────────────────────────────┐
│                    AEOS Core Rules                      │
│   (Constitution, Playbooks, Standards, Templates)       │
└────────────────────────────┬────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
        ┌───────────────────┐ ┌───────────────────┐
        │  Antigravity Adp. │ │  Claude Code Adp. │
        └─────────┬─────────┘ └─────────┬─────────┘
                  ▼                     ▼
        ┌───────────────────┐ ┌───────────────────┐
        │  Antigravity IDE  │ │  Claude Code CLI  │
        └───────────────────┘ └───────────────────┘
```

1. **Agent-Agnostic Core**: The core rules (`constitution/` and `standards/`) contain pure engineering specifications.
2. **Adapter Layer**: Each platform adapter translates these core specifications into the platform-specific syntax (e.g., `.cursorrules` file or Antigravity `.agents/AGENTS.md` format).
3. **Approval Policy (L0-L7)**: Risk levels dictate the degree of human intervention, ensuring high safety for critical actions while maintaining speed for trivial tasks.
4. **Structured Memory System**: Context files are maintained under `memory/` so that any agent that picks up the project instantly understands the technical debt, decisions, and context without querying files repeatedly.
