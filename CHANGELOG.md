# 📝 AEOS 更新日志 (CHANGELOG)

所有 AI Engineering OS (AEOS) 的版本发布与核心演进在此持久化记录。

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
