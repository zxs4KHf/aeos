# 🔬 踩坑经验与教训日志 (LESSONS_LEARNED)

> [!NOTE]
> **使用指南**：本文件属于**动态记忆层 (Dynamic Memory Layer)**。用于持久化记录团队及智能体在开发、联调、测试及部署过程中踩过的“技术坑”、环境配置暗礁以及调试技巧。后续会话读取此文件后，能够自动避免重复犯错，极大提高研发效率。

---

## 一、 环境与操作系统陷阱 (OS & Environments)

1. **Windows 路径反斜杠（Backslash）灾难**：
   - *问题*：在 Windows 系统下执行文件读取或写工具时，路径经常被返回为 `\`（如 `C:\Users\...`）。这在 JSON 解析或 shell 命令拼接中会被误认为转义符，导致路径断裂报错。
   - *教训*：在所有 JS 代码及命令执行参数中，一律使用 `path.resolve()` 并对反斜杠做替换：`path.replace(/\\/g, '/')`。统一使用正斜杠 `/` 进行路径声明。
2. **Windows Shell 命令执行挂起**：
   - *问题*：直接使用 `spawn('node')` 启动 detached 外部进程在 Windows PowerShell 下可能会引起进程句柄残留，终端关闭后进程不退出。
   - *教训*：必须在后台进程脚本中显式引入 `process.ppid` 周期自检，若父进程死亡则必须调用 `process.exit(0)` 主动自毁（见 Node.js Bot 自毁 SOP）。

---

## 二、 第三方 API / SDK 接入陷阱 (Third-Party APIs)

1. **飞书多维表格（Bitable）默认空白子表问题**：
   - *问题*：通过 Lark SDK 接口创建新 Bitable 时，开放平台会自动追加生成一张名为 **“数据表”** 的空表。如果直接往新建的“习惯配置表”写数据，用户打开链接时会默认展示空白表，造成“没有生成数据”的感官误区。
   - *教训*：在生成我们所需的提醒配置表后，必须显式调用删除子表 API，把默认的 **“数据表”** 从 Bitable 中移除，迫使 Bitable 展示我们真实的 Reminders 表。

---

## 三、 持久化与并发读写陷阱 (DB & Concurrency)

1. **SQLite 忙死锁（Database is locked）报错**：
   - *问题*：在执行多 Pollers 异步读取任务时，如果没配置 WAL 并发模式，SQLite 在高频读写或大写事务时会直接抛出 `SQLITE_BUSY: database is locked`。
   - *教训*：在 SQLite 客户端初始化时，必须执行 `PRAGMA journal_mode=WAL;` 且必须指定 `PRAGMA busy_timeout=5000;`，让读写冲突时平滑等待 5 秒而不是直接抛错崩溃。
