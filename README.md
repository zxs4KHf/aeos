# AI Engineering OS (AEOS)

AEOS 是一个跨 AI 编程代理的工程策略编译器与工作流工具包。它把平台无关的工程规则维护为结构化策略，再生成 Codex、Cursor、Claude Code、Cline、GitHub Copilot、Gemini、Antigravity 和 API Agent 可读取的原生入口文件。

当前版本：`2.0.0-alpha.1`

> AEOS 是治理与上下文层，不是 Agent Runtime。它不会绕过或替代宿主平台的沙箱、权限和审批机制。

## 核心设计

```text
policies/core.json
        |
        v
Schema and semantic validation
        |
        v
Platform renderers ---------> concise native entry files
        |                              |
        |                              v
        +--------------------> .aeos/knowledge/
                                       |
                                       v
                              load details on demand
```

AEOS 2.0 将上下文拆成两层：

- **短入口**：始终加载，只包含优先级、核心规则和知识地图。目前每个平台入口为 41-46 行。
- **知识包**：部署到目标项目的 `.aeos/knowledge/`，Agent 仅在任务相关时读取标准、工作流、Playbook 和模板。

## 目录

```text
AEOS/
├── policies/            # 机器可校验的核心策略源
├── adapters/            # 编译器、安装器与平台能力配置
├── constitution/        # 人类可读的治理原则
├── standards/           # 详细工程标准
├── workflows/           # 可选研发工作流
├── playbooks/           # 技术栈专项指南
├── templates/           # PRD、ADR、RFC、复盘和项目记忆模板
├── memory/              # AEOS 自身的已验证项目事实
├── roadmap/             # 历史设计与 2.0 演进文档
├── test/                # 编译与安全安装测试
└── dist/                # 确定性生成的平台产物
```

## 快速开始

要求 Node.js 20 或更高版本。

```bash
npm ci
npm run build
npm test
```

检查已提交的生成物是否与策略源一致：

```bash
npm run check
```

## 生成平台规则

```bash
node adapters/compiler.js --platform all
node adapters/compiler.js --platform cursor
node adapters/compiler.js --platform claude
```

当前原生输出：

| 平台 | 生成格式 |
| --- | --- |
| Codex / AGENTS.md 兼容 Agent | `AGENTS.md` |
| Cursor | `.cursor/rules/aeos-core.mdc` |
| Claude Code | `CLAUDE.md` |
| Cline | `.clinerules/00-aeos-core.md` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini | `GEMINI.md` |
| Antigravity | `.agents/AGENTS.md` |
| ChatGPT / API Agent | `.aeos/system/chatgpt.md` |

平台和目标路径统一声明在 `adapters/config.json`。编译器会验证配置、策略 ID、源文档引用、renderer 和入口行数预算，并通过 `dist/manifest.json` 记录输出哈希。

## 接入目标项目

先预览，不写入文件：

```bash
node adapters/integrator.js --path "D:/projects/example" --platform cursor --dry-run
```

确认后安装：

```bash
node adapters/integrator.js --path "D:/projects/example" --platform cursor
```

需要多个客户端时，建议按实际使用的平台分别执行安装。安装清单会增量保留已有平台。`--platform all` 主要用于兼容性测试；部分客户端会同时读取 `AGENTS.md` 和自己的原生文件，全部安装可能产生重复上下文。

安装器会：

- 生成平台原生入口文件。
- 复制详细知识到 `.aeos/knowledge/`。
- 初始化 `.aeos/PROJECT_CONTEXT.md` 等项目事实模板。
- 写入 `.aeos/install-manifest.json`，用于识别后续可安全升级的文件。

默认情况下，安装器拒绝覆盖不属于 AEOS 或被用户修改过的文件。确需替换时使用 `--force`，原文件会先保存到 `.aeos/backups/<timestamp>/`。

```bash
node adapters/integrator.js --path "D:/projects/example" --platform claude --force
```

只安装平台入口、不复制知识包：

```bash
node adapters/integrator.js --path "D:/projects/example" --platform codex --no-knowledge
```

## 修改规则

核心、始终加载的规则维护在 `policies/core.json`。每条策略必须包含：

- 稳定且唯一的 `id`
- `required` 或 `recommended` 级别
- 适用 `scope`
- 可执行的 `statement`
- 设计理由 `rationale`
- 完成证据 `evidence`
- 人类可读的 `source`

详细说明放在 `standards/` 或 `workflows/`，不要把所有内容重新塞回核心策略。修改后运行：

```bash
npm run build
npm run verify
```

## 当前边界

- L0-L7 风险模型目前是设计语言，不直接执行宿主权限控制。
- 工作流目前是按需知识文档，尚未全部转换为各平台 Skills 或 Commands。
- 2.0 仍处于 alpha；历史 v0.1 文档只用于追溯，不代表当前已实现能力。

当前架构与下一阶段计划见 [roadmap/architecture_v2.md](roadmap/architecture_v2.md)。
