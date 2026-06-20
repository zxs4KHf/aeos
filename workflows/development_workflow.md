# 🔄 研发全生命周期工作流 (Development Workflow) v0.6.0

本指南规定了 AI 智能体在处理开发需求时必须遵循的完整行为生命周期（从获取任务、调研设计、代码编写、QA自测、审查发布到记忆归档的完整 SOP 流程）。

---

## 研发生命周期总览

```text
[Backlog (未开始)]
       │
       ▼ (1. 调研分析)
[Designing (调研设计)] ──► 输出 PRD / Architecture ──► 等待用户评审授权
                                                              │
                                                              ▼ (2. 批准授权)
[Coding (正在开发)] ────► 渐进式编写核心代码 (满足 SOLID 规范)
                                                              │
                                                              ▼ (3. 闭环测试)
[Testing (自检测试)] ───► 运行单元与集成测试、多模态视检 UI
                                                              │
                                                              ▼ (4. 联合评审)
[Reviewing (代码评审)] ──► 输出 Walkthrough.md ──► Artifact 分栏评审
                                                              │
                                                              ▼ (5. 版本发布)
[Released (完成交付)] ──► 更新 CHANGELOG / 打 Git Tag 🏷️ ──► 记忆提取归档
```

---

## 一、 调研设计阶段 (Designing)

1. **装载上下文**：
   - 智能体启动任务时，必须先读取 `memory/PROJECT_CONTEXT.md`，了解项目的全局技术画像，杜绝盲目扫描整个源码目录。
2. **编写/更新 PRD 与架构图**：
   - 根据需求，在 `roadmap/` 下新建或修改 PRD 文档（参考 [prd_template.md](file:///d:/vibecoding/aeos/templates/prd_template.md)）和架构设计文档。
   - 若引入新的技术选型，必须同时输出 ADR 决策记录。
3. **安全审查定级**：
   - 评估本次功能修改对应的 **L0-L7 安全层级**。若包含 L5（命令执行）、L6（修改依赖环境）或 L7（高危发布），必须显式告知用户。
4. **获取明确审批**：
   - 将设计文档同步推送为 Artifact，主动暂停执行，等待用户批准后方可进入 Coding 阶段。

---

## 二、 代码开发阶段 (Coding)

1. **任务颗粒度细化**：
   - 在 `task.md` 任务看板中将获批的设计方案细化为小粒度的组件级 TODO 项。
2. **循序渐进修改 (Incremental Coding)**：
   - 严格遵循 [代码规范](file:///d:/vibecoding/aeos/standards/coding_standard.md) 与 SOLID 原则，每次仅修改单一职责文件，禁止大范围无序改动。
   - 每次代码修改时，应保留并维护原有的 JSDoc/Docstring 声明，并按需添加行内 `Why` 注释。
3. **依赖与安全校验**：
   - 严禁引入幽灵依赖。若确需安装第三方库，必须通过 L6 级用户点击授权，并确保 `package-lock.json` 或 `pnpm-lock.yaml` 同步锁定。

---

## 三、 自检测试阶段 (Testing)

1. **测试用例编写**：
   - 遵循测试金字塔原则，编写核心业务逻辑的单元测试。
2. **运行本地校验 (Lint & Test)**：
   - 执行本地静态语法校验（Lint）及测试套件，确保 100% 编译通过且新增用例全部 Pass。
3. **多模态界面视检 (Visual Review)**：
   - 若涉及前端 UI 改动，必须启动本地开发服务器并截屏。
   - 利用多模态视觉能力检查渲染正确性（无重叠文字、支持 375px/1440px 响应式分辨率），并在交付报告中附带截图。

---

## 四、 联合评审阶段 (Reviewing)

1. **生成变更说明 (Walkthrough)**：
   - 在 Brain 目录下生成/更新 `walkthrough.md`。列出具体的代码变更 Diff 块、验证过程以及测试结果。
2. **侧边分栏同步**：
   - 触发 Artifact 镜像推送，在右侧窗口以 Carousel 轮播或卡片方式向用户展示更改内容。
   - 等待用户批改并处理用户划线建议。

---

## 五、 版本发布与记忆归档 (Released)

1. **Conventional Commits 提交**：
   - 执行 `git commit`，消息格式必须符合 Conventional Commits 规范（如 `feat: add api fallback controller`）。
2. **更新 CHANGELOG**：
   - 在根目录的 `CHANGELOG.md` 中追加本次发布版本的增删改明细。
3. **打上语义化 Tag**：
   - 本地打上 Git 语义化版本 Tag（如 `git tag v1.0.0-alpha`）。
4. **记忆回流归档**：
   - 提取本次 Turn 中产生的技术债写入 `memory/TECHNICAL_DEBT.md`。
   - 将调试踩坑记录写入 `memory/LESSONS_LEARNED.md`，清理本地临时 scratch 调试脚本。
