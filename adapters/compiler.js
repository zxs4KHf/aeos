/**
 * AI Engineering OS (AEOS) Adapter Compiler
 * 
 * 读取 adapters/config.json 管道配置，将平台无关的 Markdown 核心规范
 * 编译并拼接为各 AI 开发平台（Antigravity, Cursor, Claude Code, Cline 等）对应的本地规则文件。
 * 
 * 使用方式：
 *   node adapters/compiler.js --platform all
 *   node adapters/compiler.js --platform cursor
 */

const fs = require('fs');
const path = require('path');

// 统一路径基准为项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 辅助打印日志
function logSuccess(msg) {
  console.log(`\x1b[32m✔\x1b[0m ${msg}`);
}
function logWarn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`);
}
function logError(msg) {
  console.log(`\x1b[31m✖\x1b[0m ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let platform = 'all';
  
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--platform' || args[i] === '-p') && args[i + 1]) {
      platform = args[i + 1].toLowerCase();
      i++;
    }
  }
  return { platform };
}

function compilePipeline(pipeline) {
  const { platform, target, sources } = pipeline;
  const targetPath = path.join(PROJECT_ROOT, target);
  
  console.log(`正在为平台 [${platform}] 编译规则...`);
  
  // 生成总头部声明
  let compiledContent = `# 🤖 AEOS COMPILED RULES FOR ${platform.toUpperCase()}\n\n`;
  compiledContent += `> [!IMPORTANT]\n`;
  compiledContent += `> 本文件是由 **AI Engineering OS (AEOS)** 适配器自动编译生成的平台专用规则。\n`;
  compiledContent += `> **请勿直接手动修改此文件**。任何修改都会在下一次 AEOS 编译构建时被覆盖。\n`;
  compiledContent += `> 若要修改规则，请直接编辑对应的 AEOS 核心规范（如 \`constitution/\` 或 \`standards/\` 下的文件），并重新运行编译命令：\n`;
  compiledContent += `> \`node adapters/compiler.js --platform ${platform}\`\n\n`;
  compiledContent += `--- \n\n`;
  
  // 逐个拼接源文件
  for (const source of sources) {
    const sourcePath = path.join(PROJECT_ROOT, source);
    if (!fs.existsSync(sourcePath)) {
      logWarn(`找不到源文件: ${source}，已跳过。`);
      continue;
    }
    
    const fileContent = fs.readFileSync(sourcePath, 'utf8');
    const relativeName = path.relative(PROJECT_ROOT, sourcePath).replace(/\\/g, '/');
    
    compiledContent += `\n\n<!-- ==================== AEOS SOURCE: ${relativeName} ==================== -->\n\n`;
    compiledContent += fileContent;
    compiledContent += `\n`;
  }
  
  // 确保目标输出目录存在
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 写入文件
  fs.writeFileSync(targetPath, compiledContent, 'utf8');
  logSuccess(`成功生成目标规则文件 -> ${target}`);
}

function main() {
  const { platform } = parseArgs();
  const configPath = path.join(PROJECT_ROOT, 'adapters', 'config.json');
  
  if (!fs.existsSync(configPath)) {
    logError(`找不到配置文件: adapters/config.json`);
    process.exit(1);
  }
  
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    logError(`解析 config.json 失败: ${err.message}`);
    process.exit(1);
  }
  
  const pipelines = config.pipelines || [];
  let compileCount = 0;
  
  for (const pipeline of pipelines) {
    if (platform === 'all' || pipeline.platform === platform) {
      try {
        compilePipeline(pipeline);
        compileCount++;
      } catch (err) {
        logError(`为 [${pipeline.platform}] 编译时发生错误: ${err.message}`);
      }
    }
  }
  
  if (compileCount === 0) {
    logWarn(`未匹配到任何需要编译的平台管道 (输入的 platform: "${platform}")`);
    process.exit(2);
  } else {
    logSuccess(`全部编译构建完成！共处理了 ${compileCount} 个适配器管道。`);
    process.exit(0);
  }
}

main();
