#!/usr/bin/env node
// Reports the always-loaded context cost of every platform entry and the size
// of the on-demand knowledge pack. This is the L4 evaluation layer's first
// metric: context cost. Adherence measurement is defined in
// eval/ADHERENCE_PROTOCOL.md.
const fs = require('node:fs');
const path = require('node:path');

const { PROJECT_ROOT, buildOutputs, estimateTokens, renderPointer } = require('../adapters/compiler');

function knowledgePackStats(config) {
  let files = 0;
  let bytes = 0;
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile()) {
        files += 1;
        bytes += fs.statSync(entryPath).size;
      }
    }
  };
  for (const directory of config.knowledge) visit(path.join(PROJECT_ROOT, directory));
  return { files, bytes, tokens: Math.ceil(bytes / 4) };
}

function report() {
  const build = buildOutputs('all');
  const canonical = build.config.pipelines.find((pipeline) => pipeline.canonical);
  const platforms = build.outputs.map((output) => {
    const fullTokens = output.tokenEstimate;
    const usesPointer = Boolean(canonical && output.pipeline.readsAgentsMd);
    const pointerTokens = usesPointer
      ? estimateTokens(renderPointer(output.pipeline, canonical.installTarget))
      : null;
    return {
      platform: output.pipeline.platform,
      lines: output.lineCount,
      fullTokens,
      pointerTokens,
      installedTokensWithCanonical: usesPointer ? pointerTokens : fullTokens
    };
  });

  const knowledge = knowledgePackStats(build.config);
  const allFull = platforms.reduce((sum, entry) => sum + entry.fullTokens, 0);
  const allWithPointers = platforms.reduce((sum, entry) => sum + entry.installedTokensWithCanonical, 0);

  return {
    budget: { maxEntryLines: build.config.maxEntryLines, maxEntryTokens: build.config.maxEntryTokens || null },
    platforms,
    knowledgePack: knowledge,
    totals: {
      allPlatformsFullTokens: allFull,
      allPlatformsWithPointersTokens: allWithPointers,
      pointerSavingsTokens: allFull - allWithPointers
    }
  };
}

function main() {
  const json = process.argv.includes('--json');
  const result = report();
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log('AEOS context cost (token estimates: characters / 4)');
  console.log(`Budget: ${result.budget.maxEntryLines} lines, ${result.budget.maxEntryTokens ?? 'n/a'} tokens per entry\n`);
  console.log('platform     lines  full~tok  pointer~tok');
  for (const entry of result.platforms) {
    const pointer = entry.pointerTokens === null ? '-' : String(entry.pointerTokens);
    console.log(`${entry.platform.padEnd(12)} ${String(entry.lines).padStart(5)} ${String(entry.fullTokens).padStart(9)} ${pointer.padStart(12)}`);
  }
  console.log(`\nKnowledge pack (on demand): ${result.knowledgePack.files} files, ${result.knowledgePack.bytes} bytes (~${result.knowledgePack.tokens} tokens)`);
  console.log(`All-platform install: ~${result.totals.allPlatformsFullTokens} tokens without pointers, ~${result.totals.allPlatformsWithPointersTokens} with pointers (saves ~${result.totals.pointerSavingsTokens}).`);
}

if (require.main === module) main();

module.exports = { report };
