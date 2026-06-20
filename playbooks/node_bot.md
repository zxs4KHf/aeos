# 🤖 Node.js Bot 开发手册 (Node.js Bot Playbook) v0.4.0

本手册规范了基于 Node.js 技术栈构建的 AI 机器人/通知助手的项目架构、消息管道、进程自愈以及部署验证的标准操作程序 (SOP)。

---

## 一、 标准目录结构

基于端口与适配器（Hexagonal Architecture）原则，Node.js Bot 的目录应高度解耦：

```text
my-bot/
├── .env                  # 本地私密环境变量（禁止提交）
├── .gitignore            # 忽略依赖、敏感数据、临时日志
├── package.json          # 项目元数据与依赖定义
├── v2-core/              # 核心框架逻辑（核心域）
│   ├── db_manager.js     # 数据库访问（Port/Adapter）
│   ├── poll_and_wait.js  # 长连接轮询自愈器（Input Adapter）
│   ├── event_bus.js      # 事件总线与解耦机制
│   ├── commands.js       # 命令解析与路由分配器
│   └── entry.js          # 守护进程启动主入口
├── roles/                # AI 专家角色定义（业务逻辑/Domain）
│   └── coder.js          # 开发者角色配置
├── skills/               # 内置工具/技能卡（Adapters）
│   └── weather.js        # 样例天气技能
└── tests/                # 自动化测试目录
    ├── mock_lark.js      # 飞书 SDK 模拟器
    └── router.test.js    # 路由及管道测试
```

---

## 二、 核心消息管道与路由架构

消息的生命周期必须遵循“接收 -> 解析 -> 判定 -> 执行 -> 回复”闭环，严禁跨层直接调用。

```text
[飞书/第三方消息源] ──WebSocket/Webhook──► [适配器: poll_and_wait.js]
                                                    │ (格式化事件)
                                                    ▼
[核心状态数据库] ◄──────读写事件轴─────────── [数据库适配器: db_manager.js]
                                                    │
                                                    ▼
[响应结果发送] ◄─────────发送 API──────────── [专家路由分配: commands.js]
```

### 2.1 端口与适配器设计规范
- **输入端口 (Input Ports)**：如长连接监听器、Webhook 路由。它们必须将平台特定的 payload 转换为 AEOS 约定的统一 `Event` 结构体：
  ```javascript
  // 统一消息事件接口
  class BotEvent {
    constructor({ taskId, chatId, senderId, text, metadata = {} }) {
      this.taskId = taskId;
      this.chatId = chatId;
      this.senderId = senderId;
      this.text = text;
      this.metadata = metadata;
      this.timestamp = Date.now();
    }
  }
  ```
- **输出端口 (Output Ports)**：消息发送、数据库读写。必须通过统一接口定义，屏蔽底层的具体实现（如 Lark SDK、SQLite）。

---

## 三、 状态持久化与并发控制

1. **事件驱动日志 (Event Sourcing)**：
   - 所有的任务状态转移（如 `task_started`, `antigravity_started`, `task_completed`, `task_failed`）均需以追加方式记录于 `spine_events.db` 中。
   - 禁止直接更新任务表的状态字段，必须通过回溯事件轴还原当前最新状态。
2. **并发锁与 SQLite WAL 模式**：
   - 必须在初始化 SQLite 数据库时启用 WAL (Write-Ahead Logging) 模式以支持多进程并发读写。
   - 对临界区写操作（如抢占空闲任务），必须配合文件锁（如 `lockfile`）或数据库排他锁，防止多 poller 实例冲突。
   - `node-sqlite3` 示例：
     ```javascript
     db.serialize(() => {
       db.run("PRAGMA journal_mode=WAL;");
       db.run("PRAGMA busy_timeout=5000;"); // 读写冲突时退避等待
     });
     ```

---

## 四、 守护进程自愈与退出监测

后台常驻的监听器（如 `poll_and_wait.js`）容易因编辑器退出、终端断开而成为“孤儿进程”，持有数据库锁。因此必须实现父进程退出监控：

### 4.1 父进程自毁检测逻辑
在 poller 进程启动时，必须挂载周期为 10 秒的定时器检测父进程是否存活。如果父进程（如 VS Code）已经死掉，则 poller 必须释放所有锁资源并主动退出：

```javascript
const checkParentProcess = () => {
  setInterval(() => {
    // 在 Windows/Linux 系统下，若父进程（PPID）发生改变或归属于 1 (init/systemd)
    // 说明拉起它的 VS Code 进程已关闭。
    if (process.ppid === 1 || !isParentAlive(process.ppid)) {
      console.warn("检测到父进程已退出，Poller 正在释放资源并安全退出...");
      cleanupAndExit();
    }
  }, 10000);
};

function isParentAlive(ppid) {
  try {
    // 尝试向父进程发送 0 信号检测其是否存在
    process.kill(ppid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function cleanupAndExit() {
  // 关闭所有打开的 sqlite db 连接
  if (global.db) {
    global.db.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}
```

---

## 五、 测试与质量保障 SOP

1. **外部 API 隔离**：
   - 单元测试及集成测试中，绝对禁止真实调用 Lark SDK 或发送真实网络请求。
   - 必须提供 `tests/mocks/` 替换 Lark 客户端，通过模拟输入触发消息管道并检验输出。
2. **冒烟测试用例**：
   - 每次版本升级（如 `npm run test`）必须校验：
     - 命令解析正则是否正确。
     - 消息解析防抖逻辑是否生效。
     - 数据库事件追加和状态判断逻辑是否正确。

---

## 六、 部署与自检 Checklist

- [ ] `.env` 文件存在且只包含测试/本地沙箱 App 凭证，不包含生产密钥。
- [ ] 确保 `node_modules` 依赖树干净，执行 `npm run lint` 无 Error。
- [ ] 注册并激活自愈程序：手动关闭 VS Code，验证后台 `node poll_and_wait.js` 进程可在 10 秒内自动销毁。
- [ ] 启动主守护进程，模拟下发一条指令，确认可在 2 秒内得到正常响应。
