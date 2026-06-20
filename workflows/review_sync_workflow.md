# 🔄 联合评审与双向同步工作流 (Review & Sync Workflow) v0.6.0

本指南规定了智能体与用户如何在 VS Code 右侧拆分面板中实现“镜像输出 -> 实时批改 -> 自动回流”的双向同步评审机制。

---

## 评审与同步数据流拓扑

```text
[本地 Git 代码树] (d:/vibecoding/aeos/roadmap/PRD_v0.1.md)
       │
       ▼ (1. 自动推送与元数据包装)
[Brain 镜像 Artifact] (C:/Users/14841/.gemini/antigravity/brain/.../PRD_v0.1.md)
       │
       ▼ (2. 右侧拆分面板实时批改)
[编辑器右侧分栏 (Artifacts UI)] ◄─── 用户在此处像普通 MD 一样直接修改或划线批注
       │
       ▼ (3. 触发保存事件)
[Sync Pipeline 中间件] ────────────► 读取 Brain 与本地 Git 文件，进行 diff 差分比对
       │
       ▼ (4. 自动回流写入)
[本地真实代码修改] ───────────────► 智能体自动合并修改 -> Git 自动 Commit 并同步
```

---

## 一、 镜像输出推送规范 (Mirror Push)
1. **触发时机**：
   - 智能体在 `roadmaps/`、`constitution/`、`standards/`、`playbooks/`、`templates/` 和 `workflows/` 下新建或修改任何文档时，必须立即将其镜像写入至当前会话的 `brain/` 根目录下。
2. **元数据声明 (Metadata Header)**：
   - 写入镜像时，必须严格配置 `ArtifactMetadata` 参数：
     - `UserFacing`: 必须设为 `true`。
     - `RequestFeedback`: 必须设为 `true`，以在右侧窗口提供“Proceed”按钮及用户即时编辑视图。
     - `Summary`: 撰写精炼的改动要点摘要。

---

## 二、 侧边分栏实时评审规范 (Split Pane Review)
1. **分栏展示**：
   - 智能体应通过回复直接引导用户关注右侧分栏，严禁在回复中大篇幅直接复制或重述 Artifact 的具体文字，避免干扰开发视线。
2. **划线批改交互**：
   - 开发者可直接在侧边分栏中修改措辞、调整目录、修改设计。
   - 智能体必须耐心等待用户修改完毕后点击保存，不得在用户未修改完前频繁调用写工具覆盖用户的修改。

---

## 三、 反向同步与数据回流规范 (Reverse Sync)
1. **差异化比对 (Diffing)**：
   - 在用户点击 Proceed 或保存后，智能体必须优先读取 `brain/` 镜像文件的最新内容。
   - 调用 diff 比对逻辑，对比镜像文件与 `d:/vibecoding/aeos/` 真实项目路径下的原文件差异。
2. **冲突检测与避障**：
   - 若本地 Git 文件在同一时间段也被修改（产生冲突），智能体**绝对禁止**暴力覆盖。
   - 必须通过 Git Merge 冲突比对，提取出冲突区域并在终端输出，或提请用户人工判定。
3. **静默同步合并**：
   - 若无冲突，智能体直接使用代码修改工具，将用户在右侧面板的最新批注合并写入本地项目路径对应的原始文件中。
   - 合并完成后，自动运行 `git add` 和 `git commit -m "docs(review): sync user feedback modifications from artifact review"`，确保批改被版本化记录。
