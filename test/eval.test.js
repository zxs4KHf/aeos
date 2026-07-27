const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const SCRIPT = path.join(__dirname, '..', 'eval', 'context-cost.js');

test('context-cost eval reports every platform and pointer savings as JSON', () => {
  const result = spawnSync(process.execPath, [SCRIPT, '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.platforms.length, 8);
  assert.ok(report.budget.maxEntryTokens >= 100);
  assert.ok(report.knowledgePack.files > 10);
  assert.ok(report.totals.pointerSavingsTokens > 0);
  const cursor = report.platforms.find((entry) => entry.platform === 'cursor');
  assert.ok(cursor.pointerTokens < cursor.fullTokens);
  const gemini = report.platforms.find((entry) => entry.platform === 'gemini');
  assert.equal(gemini.pointerTokens, null);
});
