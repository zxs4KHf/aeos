/**
 * AI Engineering OS (AEOS) Project Integrator
 * 
 * 一键自动将 AEOS 规范部署到新项目路径，生成平台规则并初始化记忆模板目录。
 * 
 * 使用方式：
 *   node adapters/integrator.js --path "<target_project_path>" --platform <platform>
 *   例如：
 *   node adapters/integrator.js --path "D:/projects/my-new-app" --platform cursor
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// 打印日志辅助
function logSuccess(msg) {
  console.log(`\x1b[32m✔\x1b[0m ${msg}`);
}
function logInfo(msg) {
  console.log(`\x1b[34mℹ\x1b[0m ${msg}`);
}
function logError(msg) {
  console.log(`\x1b[31m✖\x1b[0m ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let targetPath = '';
  let platform = '';

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--path' || args[i] === '-d') && args[i + 1]) {
      targetPath = args[i + 1];
      i++;
    } else if ((args[i] === '--platform' || args[i] === '-p') && args[i + 1]) {
      platform = args[i + 1].toLowerCase();
      i++;
    }
  }

  return { targetPath, platform };
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRule(sourceName, targetDestPath) {
  const sourcePath = path.join(PROJECT_ROOT, 'dist', sourceName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`找不到已编译的源规则文件: ${sourceName}，请先确保编译成功。`);
  }
  ensureDirExists(path.dirname(targetDestPath));
  fs.copyFileSync(sourcePath, targetDestPath);
  logSuccess(`已成功部署规则到 -> ${path.relative(process.cwd(), targetDestPath)}`);
}

function initMemoryTemplates(targetProjectDir) {
  const memoryDir = path.join(targetProjectDir, 'memory');
  ensureDirExists(memoryDir);

  const templates = {
    'PROJECT_CONTEXT.md': `# 项目上下文画像 (PROJECT_CONTEXT)

## 1. 项目基本定位
- **名称**: [项目名称]
- **主要功能**: [此项目的主要用途是什么]
- **技术栈**: [核心语言、框架、主要依赖]

## 2. 关键业务流
- [说明项目的核心模块与主要调用链关系]
`,
    'TECHNICAL_DEBT.md': `# 技术债务记录 (TECHNICAL_DEBT)

本文件用于记录在开发重构中遗留 of 后续待优化改进的隐患与代办事项。

| 问题ID | 影响模块 | 问题描述 | 严重级别 | 修复对策 |
| :--- | :--- | :--- | :--- | :--- |
| **D-001** | [模块名] | [遗留的技术债描述] | 🟡 中度 | [推荐重构思路] |
`,
    'DECISIONS.md': `# 架构决定日志 (DECISIONS)

本文件记录项目中做出的重大架构决策，用以规避未来重复试错。

## [ADR-001] [决策简述]
- **状态**: 🟢 已采纳
- **背景**: [为什么需要做此选择]
- **决定**: [最终的技术选型或结构设计]
- **长远后果**: [带来哪些好处或新的限制]
`
  };

  for (const [filename, content] of Object.entries(templates)) {
    const filePath = path.join(memoryDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      logSuccess(`已初始化记忆模板 -> memory/${filename}`);
    } else {
      logInfo(`模板文件已存在，跳过初始化 -> memory/${filename}`);
    }
  }
}

function main() {
  const { targetPath, platform } = parseArgs();

  if (!targetPath) {
    logError('请指定目标项目路径 (--path 或 -d)');
    process.exit(1);
  }
  if (!platform) {
    logError('请指定规则对应的部署平台 (--platform 或 -p)');
    logInfo('可选值: cursor, cline, claudecode, antigravity, chatgpt, codex, all');
    process.exit(1);
  }

  const targetDir = path.resolve(targetPath);
  logInfo(`开始将 AEOS 规范部署到项目路径: "${targetDir}" ...`);

  // 1. 自动执行编译以确保最新
  logInfo('正在执行 AEOS 编译器以同步最新核心规范...');
  try {
    execSync(`node "${path.join(PROJECT_ROOT, 'adapters', 'compiler.js')}" --platform all`, { stdio: 'ignore' });
    logSuccess('核心规范编译完成。');
  } catch (err) {
    logError(`编译核心规范失败: ${err.message}`);
    process.exit(1);
  }

  // 2. 拷贝部署规则文件
  try {
    const validPlatforms = ['cursor', 'cline', 'claudecode', 'antigravity', 'chatgpt', 'codex', 'all'];
    if (!validPlatforms.includes(platform)) {
      throw new Error(`非法的平台名称: "${platform}"。可选值: ${validPlatforms.join(', ')}`);
    }

    if (platform === 'cursor' || platform === 'all') {
      copyRule('.cursorrules', path.join(targetDir, '.cursorrules'));
    }
    if (platform === 'cline' || platform === 'all') {
      copyRule('.clinerules', path.join(targetDir, '.clinerules'));
    }
    if (platform === 'claudecode' || platform === 'all') {
      copyRule('.clauderules', path.join(targetDir, '.clauderules'));
    }
    if (platform === 'antigravity' || platform === 'all') {
      copyRule('AGENTS.md', path.join(targetDir, '.agents', 'AGENTS.md'));
    }
    if (platform === 'codex' || platform === 'all') {
      copyRule('codex_system.md', path.join(targetDir, 'AGENTS.md'));
    }
    if (platform === 'chatgpt' || platform === 'all') {
      copyRule('chatgpt_system.md', path.join(targetDir, 'chatgpt_system.md'));
    }

    // 3. 初始化记忆模板目录
    logInfo('正在初始化目标项目的 memory/ 记忆模板目录...');
    initMemoryTemplates(targetDir);

    logSuccess(`AEOS 规范已成功一键部署到项目！`);
    process.exit(0);
  } catch (err) {
    logError(`部署规则时发生错误: ${err.message}`);
    process.exit(1);
  }
}

main();
