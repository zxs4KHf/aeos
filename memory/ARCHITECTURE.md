# 📐 系统架构状态说明 (ARCHITECTURE)

> [!NOTE]
> **使用指南**：本文件属于**静态记忆层 (Static Memory Layer)**。它用于声明项目的最新物理/逻辑分层拓扑、接口调用契约及数据库状态。用于帮助智能体在重构、扩展模块时，快速了解已有组件的交互边界，避免破坏六角架构（Hexagonal Architecture）的分层原则。

---

## 一、 系统架构总览 (Architecture Topology)

本项目采用**端口与适配器（Hexagonal Architecture / 六角架构）**分层模型，以保证核心业务与外部 I/O 环境（如特定平台 SDK、文件读写）解耦：

```text
       [输入源: Webhook/长连接/CLI] ──► (输入适配器) ──► 统一接口 (Ports)
                                                                 │
                                                                 ▼
                                                        [核心业务域 (Domain)]
                                                                 │
                                                                 ▼
       [数据库/外部 API] ◄────────────── (输出适配器) ◄── 统一接口 (Ports)
```

---

## 二、 物理分层职责规范 (Folder Layering)

- **`v2-core/` 或 `src/` (核心层)**：
  - 职责：包含系统最高层控制流、数据库初始化和多项目分配调度。
  - 依赖关系：严禁直接依赖具体适配器（如 Lark-SDK），只能通过 Ports 调用。
- **`roles/` 或 `domain/` (领域业务层)**：
  - 职责：实现核心业务规则和智能体角色特征。
- **`skills/` 或 `adapters/` (适配器层)**：
  - 职责：实现与具体平台的 API 交互、文件写入、第三方系统集成。

---

## 三、 数据持久化与数据库架构 (Database Schema)

本项目主要状态数据持久化记录于 `spine_events.db` SQLite 数据库中：

### 3.1 核心表 Schema
```sql
-- 事件追踪总表
CREATE TABLE IF NOT EXISTS spine_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    task_id TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 并发与锁配置
- 强制配置 SQLite 为 **WAL (Write-Ahead Logging)** 模式，保证并发读写时互不阻塞。
- 使用 `PRAGMA busy_timeout = 5000;` 应对数据库忙，避免直接抛错挂起。

---

## 四、 异常降级与故障恢复 (Degradation & Recovery)

1. **孤儿进程自愈回收**：
   - 守护进程（Poller）必须挂载父进程存活心跳（`process.ppid` 定时轮询）。一旦检测到 VS Code 主窗口或拉起它的进程退出，Poller 自动释放数据库写锁并优雅自毁。
2. **API 超时降级**：
   - 外部调用设有超时阈值（例如 10000ms）。超时后自动抛出异常并触发本地临时缓存数据读取。
