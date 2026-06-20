# 🔬 AI Engineering OS (AEOS) v0.1 调研与技术选型报告

本报告对当前主流的 AI 智能体（Agent）架构、经典软件工程规范以及现代化产品研发流程进行了系统的调研与对比，以此奠定 **AI Engineering OS (AEOS)** 的技术选型与设计合理性。

---

## 一、 AI 智能体（Agent）架构对比调研

我们分析了当前行业中最前沿的自动编码与工作流智能体，提炼其核心优势并识别其设计限制。

### 1.1 Claude Code & Anthropic 最佳实践
- **核心机制**：基于长连接 WebSocket 的命令行循环（CLI-driven loop）。直接获取本地 Shell 执行权限，调用文件读写、Grep 检索及命令行执行工具。
- **核心优势**：极致的多步推理效率，极高的工具调用响应速度。
- **最佳实践要求**：强调“变更后必须运行测试（Test post-modification）”，尽量减少单次扫描目录的大小，编写高度内聚的轻量脚本，严禁使用复杂的单行拼接命令。

### 1.2 Devin & OpenHands (原 OpenDevin)
- **Devin**：集成了计划拆分器（Planner）、终端日志校验器、浏览器测试以及可视化的 TODO 状态管理器。
- **OpenHands**：基于 Docker 沙箱环境的安全工具执行流。
- **设计启发**：可视化的计划拆分和进度的可视化展示（TODO Task List）是保障 Agent 长期任务成功率的关键，沙箱环境对于执行高危指令必不可少。

### 1.3 Cursor Rules, Roo Code & Cline (.clinerules)
- **核心机制**：通过本地策略文件（如 `.cursorrules`, `.clinerules`）加载提示词，依据当前打开的文件路径动态注入系统 Prompt 上下文。
- **核心优势**：零部署成本，运行速度快，与 IDE 深度集成。
- **设计缺陷**：与具体 IDE 严重绑定，无法跨客户端/智能体复用（例如 Cursor 规则无法直接在 Claude Code 或命令行中使用）。

### 1.4 编排框架 (LangGraph, CrewAI, AutoGen)
- **核心机制**：通过状态机、角色分工（Role-play）与消息总线，将任务分发给不同的专家 Subagent。
- **设计启发**：必须实现“计划者 (Planner)”与“执行者 (Executor)”的角色分离，以提升复杂算法或重构任务的准确率。

---

## 二、 经典软件工程规范的引入

AEOS 的底层架构并非凭空虚造，而是构建在经典的软件工程规范之上：

### 2.1 Google Engineering Practices (谷歌工程规范)
- **规范提炼**：倡导极小的单次代码改动（Small CLs），接口和公共类前置文档定义，严格的单元测试/集成测试覆盖，以及可回溯的代码 Review 检查清单。
- **AEOS 应用**：在工作流中强制要求“单次工具执行仅做一件事”，禁止一次性进行跨模块的大幅修改。

### 2.2 Amazon Working Backwards (亚马逊逆向工作法)
- **规范提炼**：在编写第一行代码前，必须先写好“新闻发布稿 (Press Release)”与“常见问题解答 (FAQ)”。
- **AEOS 应用**：在进入编码阶段前，强制要求 Agent 必须先输出产品需求文档（PRD）和系统架构设计（Architecture），由人评审通过后才能开工。

### 2.3 ADR (Architecture Decision Record) 与 RFC (征求意见稿)
- **规范提炼**：每次重大架构改动或技术选型（如数据库切换、引入新库）必须以 Markdown 文件格式持久化记录在 Git 树中，记录背景、替代方案、决策理由及后果。
- **AEOS 应用**：在 `memory/` 中设立 `decisions/` 分支，对所有重大技术选型进行版本化归档。

### 2.4 六角架构 (Hexagonal/Ports & Adapters) 与 SOLID
- **规范提炼**：将核心业务逻辑与外部依赖（数据库、网络接口、特定运行客户端）通过接口（Ports）进行彻底隔离。
- **AEOS 应用**：AEOS Core（宪章与标准）是纯粹的业务规范定义，与任何特定 Agent（如 Antigravity 或 Claude Code）解耦。不同的平台客户端被抽象为 **Adapter**，只负责将 AEOS 标准翻译为各自平台能够解析的规则格式。

---

## 三、 产品研发与质量控制流 (R&D Workflow)

AEOS 定义了标准的研发生命周期，任何接入的 Agent 必须遵循此工作流：

```text
需求分析 (PRD) ──► 架构设计 (RFC) ──► 任务拆分 (Task) ──► 渐进编码 (Code)
                                                                 │
                                                                 ▼
Changelog 更新 ◄── 版本发布 (Release) ◄── 代码评审 (Review) ◄── 自动化自测 (Test)
```

---

## 四、 结论与 AEOS 核心演进策略

通过上述调研，AEOS 的底层架构确立了以下核心原则：
1. **解耦的适配器机制**：核心规则保持 Agent/Prompt 无关，各平台专用 Adapter 负责动态生成如 `.cursorrules` 的适配配置。
2. **交互式 Artifact 评审**：将关键文档（PRD, Architecture）以 Artifacts 镜像映射，让开发者在 VS Code 右侧面板进行批改评论，打通双向反馈通路。
3. **L0-L7 授权与审批边界**：根据风险系数，强制执行差异化的人工介入策略，在安全性和开发效率之间取得完美平衡。
