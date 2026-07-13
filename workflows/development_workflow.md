# 研发工作流 v2.0

Status: active

本工作流按任务风险选择深度，而不是要求所有任务经过相同仪式。

## 一、选择 Profile

### Lean

适用于局部、可逆、影响面清晰的任务，例如文档修正、小型 Bug 或单文件配置调整。

```text
Inspect -> Implement -> Targeted Verify -> Handoff
```

### Standard

适用于普通功能、跨文件修改或会影响共享接口的任务。

```text
Inspect -> Short Plan -> Implement -> Tests and Review -> Handoff
```

### Full

适用于架构变化、数据迁移、安全敏感、外部发布或难回滚任务。

```text
Context -> Specification -> Alternatives and Decision -> Approval
        -> Staged Implementation -> Broad Verification -> Rollout and Handoff
```

## 二、共同阶段

### 1. Inspect

- 读取相关仓库规则、代码、测试、配置和工作区状态。
- 验证项目记忆是否仍与代码一致；冲突时以代码和可执行证据为准。
- 识别用户未授权的外部副作用。

### 2. Define

- 明确目标、非目标、验收条件和风险。
- Standard 任务使用简短计划即可。
- Full 任务记录备选方案、长期后果、迁移与回滚策略。

### 3. Implement

- 遵循仓库现有结构和工具链。
- 保持改动范围集中，避免覆盖无关用户修改。
- 新增依赖时说明必要性，并更新 manifest 与 lockfile。

### 4. Verify

- 从最接近改动的测试开始。
- 共享契约、数据结构或用户路径受影响时，扩大到集成或端到端验证。
- UI 变化在适用时进行真实渲染和关键视口检查。
- 记录未能执行的检查及其残余风险。

### 5. Handoff

- 简洁说明结果、关键文件和验证命令。
- 区分已完成工作与后续建议。
- 仅在事实发生持久变化时更新项目记忆。

## 三、升级条件

任务出现以下情况时提升 Profile：公共 API 变化、数据迁移、权限边界变化、跨服务协议、生产副作用、不可逆操作或需求存在重大歧义。

任务范围缩小且风险被证据排除时，可以降低 Profile，并在交付说明中简述原因。
