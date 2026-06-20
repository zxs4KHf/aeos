# 💻 命令行工具开发手册 (CLI Tool Playbook) v0.4.0

本手册规范了使用 Node.js (或 Python) 构建命令行接口 (CLI) 工具的项目工程结构、命令行 UI/UX 规范、错误控制和单元测试的标准操作程序 (SOP)。

---

## 一、 标准目录结构

CLI 项目应当专注于入口解析与业务核心实现的清晰分离：

```text
my-cli/
├── bin/
│   └── cli.js            # CLI 执行入口（设置 Shebang 头部，处理参数解析）
├── src/
│   ├── commands/         # 子命令具体逻辑实现
│   │   ├── init.js       # 样例：my-cli init
│   │   └── run.js        # 样例：my-cli run
│   ├── utils/            # 工具库（文件读写、日志格式化、终端样式）
│   └── index.js          # SDK 层导出，方便第三方以 API 形式集成
├── tests/                # 测试集
│   └── cli.test.js       # 模拟 argv 并捕获 stdout 的集成测试
├── package.json          # bin 指令映射及发布配置
└── README.md             # 命令使用指南与 CLI 动图演示
```

---

## 二、 命令行 UI/UX 体验规范 (CLI UX)

命令行不仅是文本输出，其色彩、版面设计、提示信息同样需要遵循严格的视觉规范：

### 2.1 色彩与分级输出规范
禁止输出未经过滤的纯白文本。应对不同日志级别配合 `chalk` 施加具有辨识度的配色方案：
- **INFO (提示信息)**: 默认为系统常规灰白色。核心字段应使用高亮（如靛蓝、品青）。
- **SUCCESS (成功反馈)**: 🟢 绿色前缀，如 `chalk.green('✔')`，用于成果达成提示。
- **WARN (警示信息)**: 🟡 黄色前缀，如 `chalk.yellow('⚠')`，表示有非致命异常。
- **ERROR (崩溃/异常)**: 🔴 红色前缀，如 `chalk.red('✖')`，并在下方缩进输出异常 Stack 详情。

### 2.2 动态交互与进度条 (Spinner & Progress Bar)
- **短耗时异步操作**（如 API 网络请求、读取短配置文件）：必须使用 Loading Spinner（如 `ora` 库），阻止光标闪烁，提升用户等待耐心。
- **长耗时循环任务**（如大文件下载、批量包编译）：必须使用进度条（如 `progress` 库），输出已完成百分比、预计剩余时间。

---

## 三、 参数解析与子命令模型

1. **库选型**：推荐使用成熟的参数解析框架，Node.js 推荐使用 `commander` 或 `yargs`，Python 推荐使用 `argparse` 或 `click`。
2. **命令定义规范**：
   - 全局支持 `-v, --version` 输出当前语义化版本。
   - 全局支持 `-h, --help` 输出格式整齐、包含子命令参数释义的帮助文档。
   - 示例配置 (`commander` 方式)：
     ```javascript
     #!/usr/bin/env node
     const { program } = require('commander');
     
     program
       .name('aeos-cli')
       .description('AI Engineering OS Helper CLI')
       .version('1.0.0');
     
     program
       .command('sync')
       .description('同步云端配置文件至本地')
       .option('-d, --dir <path>', '指定同步的目标路径', './config')
       .action((options) => {
         // 调用 src/commands/sync.js 执行同步逻辑
         require('../src/commands/sync')(options);
       });
     
     program.parse(process.argv);
     ```

---

## 四、 错误边界与标准退出状态码 (Exit Codes)

命令行工具必须严格通过退出状态码告知操作系统执行状态。严禁所有异常混用 `process.exit(1)`。

| 退出码 | 对应语义 | 触发场景示例 |
| :--- | :--- | :--- |
| **0** | Success | 执行成功，没有发生任何异常。 |
| **1** | Catch-all for general errors | 未知捕获系统崩溃。 |
| **2** | Misuse of shell builtins | 命令行参数缺失、输入命令拼写错误。 |
| **126** | Command invoked cannot execute | 没有读取/写入或执行文件的权限。 |
| **127** | Command not found | 指定的可执行文件或外部依赖命令在 PATH 中不存在。 |
| **128+N** | Fatal error signal "N" | 进程被外部信号强行关闭，如 `SIGINT` (Ctrl+C 触发 130)。 |

---

## 五、 CLI 单元测试 SOP (Mock Testing)

对 CLI 的测试应尽可能避免真实产生副作用（如真实的系统文件写入）。
1. **进程参数注入测试**：
   - 通过在测试用例中动态重写 `process.argv`，并动态加载入口脚本来模拟不同的参数输入。
2. **I/O 流捕获验证**：
   - 劫持 `process.stdout.write` 或利用专门的 CLI 测试工具（如 `execa`）运行命令，捕获其标准输出流与标准错误流，验证其包含期望的关键词。
   - 示例测试代码：
     ```javascript
     const execa = require('execa');
     
     test('cli sync command runs successfully', async () => {
       const { stdout, exitCode } = await execa('node', ['./bin/cli.js', 'sync', '-d', './tmp']);
       expect(exitCode).toBe(0);
       expect(stdout).toContain('✔ 同步完成');
     });
     ```
