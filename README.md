# AI Engineering OS (AEOS)

AEOS 是一个跨 AI 编程代理的工程策略编译器与工作流工具包。它把平台无关的工程规则维护为结构化策略，再生成 Codex、Cursor、Claude Code、Cline、GitHub Copilot、Gemini、Antigravity 和 API Agent 可读取的原生入口文件。

当前版本：`2.0.0-alpha.5` · English: [README.en.md](README.en.md) · 顶层设计: [roadmap/design_2026-07.md](roadmap/design_2026-07.md)

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

要求 Node.js 22 或更高版本，推荐使用 Node.js 24 LTS。

```bash
npm ci
npm run build
npm test
```

npm 发布后也可以直接运行：

```bash
npx @zxs4khf/aeos init --path /path/to/project --platform cursor
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

## CLI

`bin/aeos.js` 是统一入口（未来的 npm/npx 入口点）：

```bash
node bin/aeos.js build                  # 渲染 dist/ 平台产物
node bin/aeos.js check                  # 校验已提交产物与策略源一致
node bin/aeos.js init   --path <dir> --platform <name>   # 安装到目标项目
node bin/aeos.js import --path <dir>    # 归集存量 Agent 指令到 .aeos/IMPORTED.md
node bin/aeos.js update --path <dir>    # 刷新已安装平台并清理孤儿文件
node bin/aeos.js doctor --path <dir>    # 诊断受管文件状态（CI 使用 --json --strict）
node bin/aeos.js diff   --path <dir>    # 预览 update 将做的变更（支持 --json）
node bin/aeos.js eject  --path <dir>    # 安全卸载（保留 .aeos/ 项目事实）
```

许可证（MIT）与英文 README 已就绪；公开包名确定为 `@zxs4khf/aeos`，npm registry 当前没有同名包。本机尚未登录 npm，实际发布需要该 scope 的 npm 身份授权。

### GitHub Action 接入

仓库自带复合 Action（`action.yml`）。把 `templates/github/aeos-onboard-workflow.yml` 复制到目标仓库的 `.github/workflows/`，手动触发即可以 PR 形式完成接入或升级，安装逻辑完全复用 CLI 的安全语义。

### 上下文成本度量

```bash
npm run eval        # 各平台入口 token 成本、指针节省、知识包体积
npm run test:fixtures
npm run eval:adherence -- --input <run.json-or-directory> --strict
```

遵循度评估已包含 3 个 golden fixture、15 个任务、中立证据 Schema 与 A/B 自动评分器；协议见 `eval/ADHERENCE_PROTOCOL.md`。

## 接入目标项目

先预览，不写入文件：

```bash
node bin/aeos.js init --path "D:/projects/example" --platform cursor --dry-run
```

确认后安装：

```bash
node bin/aeos.js init --path "D:/projects/example" --platform cursor
```

需要多个客户端时，按实际使用的平台分别执行安装，安装清单会增量保留已有平台。安装了 canonical `AGENTS.md`（codex 平台）后，Cursor、Claude Code、Copilot 这类已原生读取 `AGENTS.md` 的客户端入口会自动渲染为几行的指针文件，避免重复上下文；单独安装某个平台时仍生成完整入口。

安装器会：

- 生成平台原生入口文件（或指针文件）。
- 复制详细知识到 `.aeos/knowledge/`。
- 初始化 `.aeos/PROJECT_CONTEXT.md` 等项目事实模板。
- 写入 `.aeos/install-manifest.json`，用于识别后续可安全升级的文件。

默认情况下，安装器拒绝覆盖不属于 AEOS 或被用户修改过的文件。确需替换时使用 `--force`，原文件会先保存到 `.aeos/backups/<timestamp>/`。

```bash
node bin/aeos.js init --path "D:/projects/example" --platform claude --force
```

只安装平台入口、不复制知识包：

```bash
node bin/aeos.js init --path "D:/projects/example" --platform codex --no-knowledge
```

## 存量项目迁移（import）

已有 `CLAUDE.md`、`.cursorrules`、copilot-instructions 的项目先跑 `aeos import`：所有存量指令被逐字归集到 `.aeos/IMPORTED.md`（原文件保留原地，AEOS 生成物自动跳过，重复执行幂等），随后 `init`/`update` 生成的入口会在知识地图里链接它。按 AEOS 优先级，仓库本地指令高于 AEOS 核心策略——导入内容随时可以人工裁剪。

## 平台差异化产物

- **Scoped 规则**：带 `appliesTo` globs 的策略会为 Cursor 生成 auto-attached 规则（如改动 `package.json`/锁文件时自动附加 DEPS-001 提醒），为 Copilot 生成 `applyTo` 分域指令。
- **Workflow 命令**：`workflows/` 编译为 Claude Code 斜杠命令（`/aeos-development`、`/aeos-incident-response`、`/aeos-review-sync`）。

两类产物都记录在安装清单里，随 update/prune/eject 全生命周期管理。

## 升级与卸载

- `update` 会刷新所有已安装平台的受管文件，并删除新版本不再提供、且未被用户修改过的孤儿文件（被修改过的会保留在磁盘上但不再纳入管理）。
- `doctor` 报告每个受管文件的状态：`ok`、`update-available`、`modified`、`missing`、`prunable`、`new`、`unmanaged-conflict`；存在冲突或损坏时退出码为 1，增加 `--strict` 后待更新也会失败，适合 CI。
- `eject` 删除所有未被修改的受管文件与安装清单，保留 `.aeos/PROJECT_CONTEXT.md` 等项目事实和备份目录；配合 `--force` 可连同修改过的文件一起移除（先备份）。

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
