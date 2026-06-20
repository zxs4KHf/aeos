# 🤖 AI Engineering OS (AEOS)

AI Engineering OS (AEOS) 是一套平台无关（Platform-Agnostic）、智能体无关（Agent-Agnostic）且 Prompt 无关（Prompt-Independent）的 **AI 软件工程操作系统规范**。

---

## 🎯 项目愿景与使命

建立一套标准化、可维护、可长期演进的 AI 软件工程规范。任何 AI Agent 接入后，都将遵循统一的开发、设计、测试、评审和风险控制流程。AEOS 将作为未来所有 Vibe Coding 项目的基础设施，让智能体遵循一致的工程标准，而非各自维护零散的规则。

---

## 📂 项目目录规范

```text
AEOS/
├── constitution/       # 核心宪章（定义 Agent 身份、L0-L7 授权与审批层级）
├── standards/          # 工程标准（代码、Git、测试、文档、性能规范）
├── playbooks/          # 开发手册（针对不同技术栈如 Web App, Bot, CLI 的最佳实践）
├── templates/          # 统一模板（PRD, Architecture, ADR, RFC, Postmortem 等）
├── workflows/          # 过程工作流（任务拆分、代码编写、QA 测试、评审发布流）
├── adapters/           # 平台适配器（将 AEOS 规范自动编译翻译为特定平台指令）
├── memory/             # 上下文记忆系统（存储静态项目上下文与动态技术债、经验教训日志）
├── docs/               # 系统文档与开发者手册
└── roadmap/            # 版本路线图（规划、调研报告、PRD 与发布日志）
```

---

## 🚀 核心设计目标 (本阶段实施)

基于用户的反馈，我们确立了以下两项重要的设计标准并将其落入核心架构：
1. **中文为首要交付标准 (Chinese Priority)**：AEOS 所有的规范、标准、决策记录均以**简体中文**作为第一官方语言，确保本地开发时沟通顺畅、批改直观。
2. **实时交互评审管道 (Interactive Artifact Review)**：
   - 所有的设计规范与蓝图文档（Roadmap, PRD, Architecture）在生成时，将自动镜像到 Antigravity 会话的 Artifacts 目录。
   - 开发者可直接在 **“右侧窗口 (Artifacts 拆分面板)”** 对文档进行实时评论与修改。
   - 智能体支持读取用户在右侧面板的修改内容，并自动将批改同步写回项目 Git 代码树，完成实时的“双向同步与联合评审”。

---

## 🚀 快速上手与使用教程

AEOS 的核心逻辑是：**“核心规范独立维护，平台规则一键编译，目标项目拷贝部署”**。

### 第一步：修改核心规范
请勿直接编辑 `dist/` 目录下的规则文件，因为它们在下一次编译时会被覆盖。
如果需要新增或修改开发标准（如代码风格、Git提交规范等），请直接在对应的源文件中修改：
- 宪章规范：[constitution/constitution.md](file:///d:/vibecoding/aeos/constitution/constitution.md)
- 各种标准：[standards/](file:///d:/vibecoding/aeos/standards) 目录下的对应 Markdown 文件
- 工作流规范：[workflows/](file:///d:/vibecoding/aeos/workflows) 目录下的对应 Markdown 文件

### 第二步：编译平台规则
在 AEOS 项目根目录下，运行适配器编译器以生成对应平台专属的规则文件：
```bash
# 编译所有平台的规则文件
node adapters/compiler.js --platform all

# 仅编译指定平台的规则（如 cursor, cline, claudecode, antigravity, chatgpt, codex）
node adapters/compiler.js --platform cursor
```
编译成功后，将在 [dist/](file:///d:/vibecoding/aeos/dist) 目录下生成对应的规则文件：
- **Antigravity** -> `dist/AGENTS.md`
- **Cursor** -> `dist/.cursorrules`
- **Cline** -> `dist/.clinerules`
- **Claude Code** -> `dist/.clauderules`
- **ChatGPT API** -> `dist/chatgpt_system.md`
- **Codex API** -> `dist/codex_system.md`

### 第三步：部署应用到您的开发项目
将编译生成的规则文件复制到您需要规范的开发项目的根目录或配置目录下：
1. **对于 Cursor 辅助的项目**：
   将 `dist/.cursorrules` 复制到目标项目的根目录下。
2. **对于 Antigravity (Feishu Bot) 辅助的项目**：
   将 `dist/AGENTS.md` 复制到目标项目工作区的 `.agents/AGENTS.md`，或者放置于全局配置目录 `C:\Users\14841\.gemini\config\AGENTS.md`。
3. **对于 Cline / Claude Code 辅助的项目**：
   分别将 `dist/.clinerules` / `dist/.clauderules` 复制到目标项目的根目录下。
4. **对于 Codex 辅助的项目**：
   将 `dist/codex_system.md` 复制到目标项目的根目录下，并命名为 `AGENTS.md`。
5. **对于其他直接使用 ChatGPT API 等自定义智能体/脚本**：
   在代码中直接读取 `dist/chatgpt_system.md`，并将其作为 System Message 传入（参见下方示例）。

部署完成后，对应的 AI 智能体在接管该项目进行开发时，便会自动加载并强制执行这套 AEOS 软件工程规范。

### 💡 ChatGPT / Codex API 调用集成示例

如果您是自主开发 AI 智能体工具或调用 ChatGPT/Codex API，可以通过以下 Node.js 代码将 AEOS 编译后的规则作为 System Prompt 注入：

```javascript
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runAgent(userPrompt) {
  // 读取编译好的 AEOS ChatGPT 系统规则提示词
  const systemPromptPath = path.join(__dirname, 'dist/chatgpt_system.md');
  const systemRules = fs.readFileSync(systemPromptPath, 'utf8');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o', // 推荐使用支持 System Prompt 的模型
    messages: [
      { role: 'system', content: systemRules },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2 // 推荐使用低 Temperature 以使模型严格遵守 AEOS 规范
  });

  console.log(completion.choices[0].message.content);
}
```

---

## 📄 核心文档索引 (可点击右侧面板实时批改)

- 📜 [AEOS 项目立项与 PRD 定义 (PRD_v0.1.md)](roadmap/PRD_v0.1.md)
- 🔬 [AEOS 技术与智能体调研报告 (research_v0.1.md)](roadmap/research_v0.1.md)
- 📐 [AEOS 系统架构与模块设计 (architecture_v0.1.md)](roadmap/architecture_v0.1.md)

