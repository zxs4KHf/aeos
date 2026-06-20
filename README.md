# 🤖 AI Engineering OS (AEOS)

AI Engineering OS (AEOS) 是一套平台无关（Platform-Agnostic）、智能体无关（Agent-Agnostic）且 Prompt 无关（Prompt-Independent）的 **AI 软件工程操作系统规范**。

---

## 🎯 项目愿景与使命

建立一套标准化、可维护、可长期演进的 AI 软件工程规范。任何 AI Agent 接入后，都将遵循统一的开发、设计、测试、评审和风险控制流程。AEOS 将作为未来所有 Vibe Coding 项目的基础设施，让智能体遵循一致的工程标准，而非各自维护零散的规则。

---

## 📂 项目目录规范

```text
AEOS/
├── constitution/       # 核心宪章（定义 Agent 身份、L0-L7 授权与审批层级）
├── standards/          # 工程标准（代码、Git、测试、文档、性能规范）
├── playbooks/          # 开发手册（针对不同技术栈如 Web App, Bot, CLI 的最佳实践）
├── templates/          # 统一模板（PRD, Architecture, ADR, RFC, Postmortem 等）
├── workflows/          # 过程工作流（任务拆分、代码编写、QA 测试、评审发布流）
├── adapters/           # 平台适配器（将 AEOS 规范自动编译翻译为特定平台指令）
├── memory/             # 上下文记忆系统（存储静态项目上下文与动态技术债、经验教训日志）
├── docs/               # 系统文档与开发者手册
└── roadmap/            # 版本路线图（规划、调研报告、PRD 与发布日志）
```

---

## 🚀 核心设计目标 (本阶段实施)

基于用户的反馈，我们确立了以下两项重要的设计标准并将其落入核心架构：
1. **中文为首要交付标准 (Chinese Priority)**：AEOS 所有的规范、标准、决策记录均以**简体中文**作为第一官方语言，确保本地开发时沟通顺畅、批改直观。
2. **实时交互评审管道 (Interactive Artifact Review)**：
   - 所有的设计规范与蓝图文档（Roadmap, PRD, Architecture）在生成时，将自动镜像到 Antigravity 会话的 Artifacts 目录。
   - 开发者可直接在 **“右侧窗口 (Artifacts 拆分面板)”** 对文档进行实时评论与修改。
   - 智能体支持读取用户在右侧面板的修改内容，并自动将批改同步写回项目 Git 代码树，完成实时的“双向同步与联合评审”。

---

## 📄 核心文档索引 (可点击右侧面板实时批改)

- 📜 [AEOS 项目立项与 PRD 定义 (PRD_v0.1.md)](roadmap/PRD_v0.1.md)
- 🔬 [AEOS 技术与智能体调研报告 (research_v0.1.md)](roadmap/research_v0.1.md)
- 📐 [AEOS 系统架构与模块设计 (architecture_v0.1.md)](roadmap/architecture_v0.1.md)
