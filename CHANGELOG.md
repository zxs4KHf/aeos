# 📝 AEOS 更新日志 (CHANGELOG)

所有 AI Engineering OS (AEOS) 的版本发布与核心演进在此持久化记录。

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
