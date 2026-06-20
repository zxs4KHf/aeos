# 📑 架构决策链总索引 (DECISIONS)

> [!NOTE]
> **使用指南**：本文件属于**决策树记忆层 (Decisions Memory Layer)**。它作为整个 AEOS 架构决策链（ADR）的总索引目录，记录了自项目初始化以来所有重大的架构路线、技术选型决策。所有列在此处的决策在状态变为 `Accepted` 后即成为最高工程规范，改动必须经过 RFC 流程。

---

## 一、 架构决策链列表 (ADR Index)

| 决策 ID | 决策标题 | 提出日期 | 当前状态 | 涉及核心组件 | 决策简短摘要 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | 采用平台无关的 Markdown 作为规范介质 | 2026-06-20 | 🟢 `Accepted` | `standards/`, `adapters/` | 所有核心规范不含 IDE 特征，采用适配器（compiler）在构建时编译分发为目标文件。 |
| **ADR-002** | 启用 SQLite WAL 并发事务及超时等待 | 2026-06-20 | 🟢 `Accepted` | `v2-core/db_manager` | 启用 WAL 模式解决多 Pollers 并发读写冲突，配置 5s 等待忙超时防阻死锁。 |
| **ADR-003** | Poller 挂载 PPID 存活轮询自毁心跳 | 2026-06-20 | 🟢 `Accepted` | `v2-core/poll_and_wait` | Poller 每 10 秒校验一次 `process.ppid`。若父进程 VS Code 关闭，则自动释放锁自毁退出。 |

---

## 二、 核心架构决策详情

### 2.1 ADR-001: 平台无关编译机制
- **背景**：以前 Cursor 采用 `.cursorrules`，Cline 采用 `.clinerules`，Antigravity 采用 `AGENTS.md`。各写各的导致修改一处规则需要多处重复粘贴，易版本冲突。
- **决定**：AEOS 所有核心文件采用纯 Markdown 在相应分类目录下编写。通过 Node 脚本 `adapters/compiler.js` 统一打包分发至 `dist/`，强制禁止在目标平台文件上直接编辑。
- **影响**：规则 100% 物理层级解耦，版本一处更新、全平台秒级编译。

### 2.2 ADR-002: SQLite WAL 与超时机制
- **背景**：多个 Poller 进程并发监听并写入同一个 `spine_events.db` SQLite 数据库。原单线程模式在读写重合时高概率抛出 `database is locked`。
- **决定**：在连接初始化时，强制执行 `PRAGMA journal_mode=WAL;`，允许读写进程并行。执行 `PRAGMA busy_timeout=5000;` 使写锁冲突时自适应退避等待，避免程序崩溃。
- **影响**：大幅提升了多项目并行托管下的数据库事务健壮性。

### 2.3 ADR-003: 父进程 PPID 自愈心跳
- **背景**：旧会话未关闭的 poller 沦为孤儿进程，持续占用 SQLite 排他锁，使新沙箱 poller 无法拉起。
- **决定**：Poller 启动时监听 `process.ppid`，周期为 10s 检测一次。若父进程变为 1 (systemd/init) 或通过信号检测断定父进程已退出，则主动 `process.exit(0)`。
- **影响**：彻底清除了跨 VS Code 会话生命周期的锁争抢死锁隐患。
