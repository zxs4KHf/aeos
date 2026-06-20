# 🐙 AEOS Git 版本控制规范 (Git Standard)

本规范定义了分支模型（Git Flow / GitHub Flow）、常规提交日志规范（Conventional Commits）以及拉取请求（PR）的合规性检验。

---

## 一、 分支生命周期管理 (GitHub Flow)

1. **主分支限制**：
   - 主分支 `main`（或 `master`）代表生产环境的稳定代码，必须保持编译与测试的 100% 成功率。
   - 严禁在主分支上直接进行高风险或未验证的大型逻辑开发。
2. **开发分支命名**：
   - 新增功能：`feat/<feature-name>`
   - 缺陷修复：`fix/<bug-desc>`
   - 架构优化/重构：`refactor/<optimize-target>`
   - 基础设施配置：`chore/<task-name>`

---

## 二、 规范提交信息 (Conventional Commits)

所有的提交信息（Commit Messages）必须包含 `type`、可选的 `scope` 以及具体的 `description`：

```text
<type>(<scope>): <description>

[body - 详细解释改动原因与实现逻辑]
```

### 核心类别 (Types) 规定：
- **`feat`**：引入了全新的功能。
- **`fix`**：修复了系统缺陷。
- **`docs`**：仅修改了文档、注释或说明性文件。
- **`style`**：仅调整代码格式，不影响逻辑（如空格、分号修正）。
- **`refactor`**：代码重构，既不新增功能也不修复 Bug。
- **`test`**：新增或修改测试用例。
- **`chore`**：修改构建工具、依赖包或 CI 流程配置。

---

## 三、 代码提交检查清单

在执行 `git commit` 前，智能体必须验证：
1. 本地代码编译且静态检查（Lint）无警告。
2. 本次改动涉及的自测任务已运行通过。
3. `CHANGELOG.md` 中已登记对应说明（如适用）。
