# 📝 AEOS 更新日志 (CHANGELOG)

所有 AI Engineering OS (AEOS) 的版本发布与核心演进在此持久化记录。

## [2.0.0-alpha.4] - 2026-07-26

### Added

- `aeos import`：归集存量 Agent 指令文件（CLAUDE.md、.cursorrules、`.cursor/rules/*`、`.clinerules/*`、copilot-instructions、GEMINI.md 等）到 `.aeos/IMPORTED.md`，原文件原地保留、AEOS 生成物自动跳过、重复导入幂等；入口知识地图自动链接导入文件（关闭 DEBT-011 / REQ-011）。
- Scoped 规则渲染：策略新增可选 `appliesTo` globs；Cursor 生成 auto-attached `.cursor/rules/aeos-<id>.mdc`，Copilot 生成 `.github/instructions/aeos-<id>.instructions.md`（applyTo）。首批落地 DEPS-001（包清单/锁文件）与 DOCS-001（Markdown/docs）（关闭 DEBT-012 / REQ-012）。
- Workflow 命令包：`workflows/` 编译为 Claude Code 仓库级斜杠命令 `.claude/commands/aeos-{development,incident-response,review-sync}.md`，支持 `$ARGUMENTS`（推进 DEBT-002 / REQ-007）。
- GitHub Action 新增 `doctor` 模式；新增目标仓库巡检 workflow 模板 `templates/github/aeos-verify-workflow.yml`（PR 上校验受管文件漂移）。

### Changed

- 安装清单新增 `scoped` 与 `command` 文件类别，升级/prune/eject 全生命周期覆盖新产物。

### Fixed

- 增量安装 canonical `AGENTS.md` 时，同步刷新既有 AGENTS.md-aware 平台入口为短指针，不再遗留 `update-available`。
- 非强制 `eject` 遇到用户修改文件时保留最小可重试 manifest，使后续 `eject --force` 能完成备份与卸载。
- 新增 `doctor --strict`，让 GitHub Verify 对待更新状态返回失败；普通交互式 doctor 仍区分健康与可升级。
- GitHub Action 通过环境变量传递输入并限制目标路径在 workspace 内；仓库 CI 实际覆盖 Linux 与 Windows。

---

## [2.0.0-alpha.3] - 2026-07-26

### Added

- 顶层设计 `roadmap/design_2026-07.md`：L0-L4 分层模型、竞争格局（ruler / rulesync / spec-kit）、平台能力矩阵、Non-goals 与路线图。
- Token 预算门：`maxEntryTokens` 配置 + 编译期强制 + `dist/manifest.json` 记录每入口 token 估算（关闭 DEBT-009）。
- 评估层 v0：`npm run eval` 输出各平台入口与知识包的上下文成本及指针节省（全平台安装 ~5.1k → ~3.5k token）；`eval/ADHERENCE_PROTOCOL.md` 定义 A/B 遵循度评估协议（推进 DEBT-005/REQ-008）。
- GitHub Action 复合封装 `action.yml`（init/update + doctor --json 校验）与示例 workflow 模板 `templates/github/aeos-onboard-workflow.yml`（PR 式接入，推进 REQ-006）。
- `doctor` / `diff` 支持 `--json` 机器可读输出，供 CI 与 Action 消费。
- LICENSE（MIT，可替换）与英文 `README.en.md`（DEBT-010 仅余 npm 包名验证，建议 scope 包名）。

### Changed

- 自托管镜像渲染改为数据驱动（`install` / `repository` 双路径上下文），移除字符串替换实现，输出逐字节一致（关闭 DEBT-008）。

---

## [2.0.0-alpha.2] - 2026-07-26

### Added

- 统一 CLI `bin/aeos.js`（`build` / `check` / `init` / `update` / `doctor` / `diff` / `eject`），并在 `package.json` 声明 `aeos` bin，作为 npm CLI 分发（DEC-007）的地基。
- 安装生命周期命令：`doctor` 诊断受管文件状态，`diff` 预览更新，`eject` 安全卸载并保留 `.aeos/` 项目事实。
- `update` 孤儿文件清理：新版本不再提供的受管文件在哈希未被用户改动时自动删除并移出清单。
- `canonical` / `readsAgentsMd` 平台能力位：安装 canonical `AGENTS.md` 后，Cursor、Claude Code、Copilot 入口渲染为短指针文件，消除 `--platform all` 的重复上下文（关闭 DEBT-007）。
- CLI 端到端 fixture 测试、指针渲染与孤儿清理测试（28 项）；CI 矩阵新增 `windows-latest`。
- 顶层评审文档 `roadmap/review_2026-07.md`，沉淀战略与工程两层优化点。

### Changed

- GitHub onboarding 决策落定为 CLI-first（ADR-007）；GitHub Action 与模板仓库将作为 CLI 的薄封装。
- 安装清单会移除配置中已不存在的平台记录，并在更新时报告。

---

## [2.0.0-alpha.1] - 2026-07-13

### Added

- 结构化核心策略与稳定 Policy ID。
- 面向 Codex、Cursor、Claude、Cline、Copilot、Gemini、Antigravity 和 API Agent 的原生短入口。
- 入口上下文预算、确定性 manifest 和生成漂移检查。
- 带 dry-run、受管文件哈希、冲突拒绝和强制备份的安全安装器。
- Node.js 原生测试、CI 与目标项目事实模板。

### Changed

- 将 AEOS 定位收敛为策略编译器内核与可选工作流工具包。
- 将详细知识改为 `.aeos/knowledge/` 按需加载，不再编译为巨型 Prompt。
- 重写 AEOS 自身 memory，使其只包含已验证项目事实。

### Removed

- 已弃用的 `.cursorrules`、`.clauderules`、单文件 `.clinerules` 和旧巨型系统提示词产物。

---

## [v1.0.0] - 2026-06-20

### 🚀 新增 (Added)
- **正式稳定版发布 (v1.0.0 Release)**：完成了 AI Engineering OS (AEOS) 规范的全部核心模块落地，可作为跨 Agent、跨平台的统一软件工程规范基础设施：
  - **核心宪章与身份**：树立智能体 Founder/Architect/Staff 联合研发身份，固化 L0-L7 安全层级与 DoD 准入。
  - **工程标准全集**：制定了代码、文档、Git、测试、架构、安全、性能、日志、依赖与版本 10 大标准规范。
  - **开发手册 SOP**：提供了 Bot、Web 前端与 CLI 命令行工具三大技术栈的最佳实践物理结构与流程。
  - **交付物统一模板**：固化了 PRD、Architecture、ADR、RFC、Postmortem 等 5 大开发交互文档格式。
  - **过程工作流控制**：编排了研发全生命周期、故障应急响应与 Artifact 联合分栏评审双向同步 3 大 SOP 动作流。
  - **适配器编译引擎**：提供 `compiler.js` 参数化构建管道，自动打包分发生成面向 Antigravity, Cursor, Claude Code, Cline 的本地编译规则。
  - **记忆上下文系统**：设计了静态（Context, Architecture）与动态（Debt, Lessons, Decisions）的上下文内存装载协议。

---

## [v0.8.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **上下文记忆系统 (`memory/`)**：正式落地了高内聚、低Token消耗的分层上下文记忆系统：
  - **项目画像上下文 (`PROJECT_CONTEXT.md`)**：提供项目愿景、技术栈清单、调试运行验证命令等静态画像信息，作为智能体首要加载的记忆域。
  - **系统架构状态说明 (`ARCHITECTURE.md`)**：固化了六角架构拓扑、物理分层职责依赖规则、事件追加 DDL 表结构与死锁防御兜底。
  - **技术债务与重构追踪 (`TECHNICAL_DEBT.md`)**：动态追踪代码边缘漏洞、未测试分支等研发技术债，与 DoD 看板形成准入卡点。
  - **踩坑经验与教训日志 (`LESSONS_LEARNED.md`)**：记录了 Windows 路径反斜杠、常驻进程常驻、Bitable 空表及 SQLite dead-lock 的排坑策略。
  - **架构决策链总索引 (`DECISIONS.md`)**：统一归档了 ADR-001 至 ADR-003 的技术选型决策与历史背景。

---

## [v0.7.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **平台适配器 (`adapters/`)**：正式落地平台无关规则的编译与构建系统：
  - **构建配置文件 (`config.json`)**：声明了针对 Antigravity, Cursor, Claude Code, Cline 四大开发平台规则包的源文件提取路径和生成目标。
  - **编译引擎脚本 (`compiler.js`)**：编写了可执行编译构建 Node 脚本。支持解析命令行平台参数，实现了多平台规则的自动化拼接与独立头部元数据分发。
  - **编译生成产物 (`dist/`)**：通过自动化管道成功编译生成了统一的 `dist/AGENTS.md`, `dist/.cursorrules`, `dist/.clauderules`, `dist/.clinerules` 四大平台专用规则。

---

## [v0.6.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **过程工作流 (`workflows/`)**：新增并制定了 3 大研发过程工作流 SOP：
  - **研发全生命周期工作流 (`development_workflow.md`)**：编排了从上下文加载（Designing）、开发编码（Coding）、自检测试（Testing）、联合评审（Reviewing）到版本发布与记忆归档的完整闭环。
  - **故障排查与复盘工作流 (`incident_response_workflow.md`)**：规范了故障检测、5分钟紧急止血防御（Mitigation）、5 Whys 根因定位、根治修复与无指责复盘（Postmortem）。
  - **联合评审与双向同步工作流 (`review_sync_workflow.md`)**：设计了镜像推送（Mirror Push）、侧边分栏编辑（Split Pane Review）与合并防冲突回流机制（Reverse Sync）。

---

## [v0.5.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **统一规范模板 (`templates/`)**：细化并制定了 5 大核心软件工程交付模板：
  - **产品需求文档模板 (`prd_template.md`)**：规范项目背景、核心范围、安全层级（L0-L7）定义及 DoD 指标验收。
  - **系统架构设计模板 (`architecture_template.md`)**：设计了包含 Mermaid 拓扑、接口签名契约、WAL 持久化并发锁与安全防注入防线。
  - **架构决策记录模板 (`adr_template.md`)**：规范了技术决策编号、上下文约束、备选方案对比与决策副作用后果。
  - **征求意见稿模板 (`rfc_template.md`)**：定义了技术重构预案、变更文件列表、伪代码示例与向后兼容性验证。
  - **事故复盘分析模板 (`postmortem_template.md`)**：秉持对事不对人原则，规范了事故时间线、根本原因分析（5 Whys）与防范改进措施（Action Items）。

---

## [v0.4.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **技术栈开发手册 (`playbooks/`)**：新增 3 项主流软件架构环境开发手册 SOP：
  - **Node.js Bot 开发手册 (`node_bot.md`)**：规范端口与适配器设计、事件驱动日志存储、WAL并发控制以及守护进程自毁灭检测（解决孤儿进程驻留问题）。
  - **Web 应用开发手册 (`web_app.md`)**：设计系统 Token 规范、极致美学与悬停微动画、API 隔离 Mock 服务，以及响应式多模态视检流程。
  - **命令行工具开发手册 (`cli_tool.md`)**：定义控制台 UI/UX 规范、分级配色与 Loading/进度条、规范状态退出码、进程参数注入单元测试。

---

## [v0.3.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **工程标准规范群 (`standards/`)**：细化了 10 项基础研发规范，模块化存储：
  - **代码规范 (`coding_standard.md`)**：变量函数大小驼峰、文件名蛇形、SOLID 与 DRY 原则。
  - **文档规范 (`documentation_standard.md`)**：核心函数 JSDoc 模板、行内 Why 注释原则。
  - **Git 规范 (`git_standard.md`)**：分支生命周期、Conventional Commits 提交格式。
  - **测试规范 (`testing_standard.md`)**：测试金字塔与修改代码后必须通过自测的铁律。
  - **架构规范 (`architecture_standard.md`)**：六角架构、端口与适配器设计及 ADR 记录规则。
  - **安全规范 (`security_standard.md`)**：凭证文件防泄漏、防御 SQL 及命令注入。
  - **性能规范 (`performance_standard.md`)**：Token 自适应指数退避轮询、WAL 并发控制。
  - **日志规范 (`logging_standard.md`)**：日志分级（DEBUG/INFO/WARN/ERROR）与 1MB 日志轮转截断。
  - **依赖规范 (`dependency_standard.md`)**：锁文件强制校验、漏洞审计及防范幽灵依赖。
  - **版本规范 (`versioning_standard.md`)**：语义化版本 SemVer 及 Tag 同步发布流程。

---

## [v0.2.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **工程宪章 (`constitution/constitution.md`)**：制定最高规则纲领。
  - **角色定义**：确立 AI Agent 为联合创始人、架构师、资深工程师身份。
  - **L0-L7 安全层级**：固化了包含 8 个维度的差异化自动/人工拦截防线。
  - **准完定义 (DoD)**：规范了编译、测试、测试用例覆盖、Changelog 及 Conventional Commit 等 6 项指标。

---

## [v0.1.0-alpha] - 2026-06-20

### 🚀 新增 (Added)
- **项目初始化**：搭建 AEOS 工程基础，创建 README。
- **调研报告 (`roadmap/research_v0.1.md`)**：对比分析主流 Agent (Claude Code, Cline, Devin) 及经典架构原则（Google, Amazon, Hexagonal）。
- **产品定义 (`roadmap/PRD_v0.1.md`)**：确定 L0-L7 授权概念及 Memory 上下文交换标准。
- **架构设计 (`roadmap/architecture_v0.1.md`)**：规划 `constitution/`, `standards/`, `playbooks/`, `templates/`, `adapters/` 模块解耦与 Artifact 交互评审机制。
