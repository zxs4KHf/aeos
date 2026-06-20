# 🏷️ AEOS 版本号与发布规范 (Versioning Standard)

本规范规定了语义化版本号格式、更新日志追加以及标签发布机制。

---

## 一、 语义化版本号 (SemVer)

AEOS 的所有开发组件与核心 OS 均遵循语义化版本命名规范 `vMAJOR.MINOR.PATCH`：

1. **`MAJOR` (主版本号)**：当引入了不兼容的 API 变动、不兼容的底层配置重构或核心流程的重大升级。
2. **`MINOR` (次版本号)**：当以向下兼容的方式引入了新的核心组件功能（如新增了 playbooks）。
3. **`PATCH` (修订号)**：当仅进行了向下兼容的缺陷修复（`fix`）或文档修正。

---

## 二、 更新日志与 Git 标签

1. **更新日志一致性 (Changelog sync)**：
   - 每次发布新版本或新子模块开发完成时，必须将改动明细登记至 `CHANGELOG.md` 中。
   - 登记需区分 `Added` (新增), `Fixed` (修复), `Changed` (修改) 三个标准模块。
2. **发布标签 (Git Tag)**：
   - 确认无误的代码必须通过 Git 命令打上对应版本的标签：
     `git tag -a vX.Y.Z -m "description of release"`
   - 标签名称必须与 `CHANGELOG.md` 里的最新登记严格一致。
