const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PROJECT_ROOT,
  buildOutputs,
  checkOutputs,
  createManifest,
  renderMirrorContent,
  resolveProjectPath,
  renderPipeline,
  validateConfig,
  validatePolicySet
} = require('../adapters/compiler');

test('builds concise native entries for every configured platform', () => {
  const build = buildOutputs('all');
  assert.deepEqual(
    build.outputs.map((output) => output.pipeline.platform),
    ['codex', 'cursor', 'claude', 'cline', 'copilot', 'gemini', 'antigravity', 'chatgpt']
  );
  for (const output of build.outputs) {
    assert.ok(output.lineCount <= build.config.maxEntryLines);
    assert.match(output.content, /AEOS-CONTEXT-001/);
    assert.match(output.content, /\.aeos\/knowledge\/standards\//);
  }
});

test('uses Cursor MDC front matter for Cursor output', () => {
  const { outputs } = buildOutputs('cursor');
  assert.match(outputs[0].content, /^---\ndescription:/);
  assert.match(outputs[0].content, /alwaysApply: true/);
});

test('renders repository mirrors with source-tree knowledge paths', () => {
  const { outputs } = buildOutputs('codex');
  const mirror = renderMirrorContent(outputs[0].content);
  assert.match(mirror, /`\.context\/CURRENT\.md`/);
  assert.match(mirror, /`memory\/PROJECT_CONTEXT\.md`/);
  assert.match(mirror, /`standards\/`/);
  assert.doesNotMatch(mirror, /\.aeos\/knowledge/);
});

test('supports platform aliases and rejects unknown platforms', () => {
  assert.equal(buildOutputs('claudecode').outputs[0].pipeline.platform, 'claude');
  assert.throws(() => buildOutputs('unknown'), /unknown platform/);
});

test('checked-in generated outputs match the policy source', () => {
  const build = buildOutputs('all');
  assert.deepEqual(checkOutputs(build), []);
  for (const output of build.outputs) {
    assert.equal(fs.readFileSync(path.join(PROJECT_ROOT, output.pipeline.target), 'utf8'), output.content);
  }
});

test('global manifest contains every configured platform', () => {
  const manifest = createManifest(buildOutputs('all'));
  assert.equal(manifest.files.length, 8);
  assert.equal(new Set(manifest.files.map((file) => file.platform)).size, 8);
});

test('config validation rejects duplicate aliases and invalid budgets', () => {
  const base = {
    schemaVersion: 2,
    policySource: 'policies/core.json',
    knowledge: [],
    maxEntryLines: 120,
    pipelines: [
      { platform: 'one', aliases: ['shared'], renderer: 'markdown', target: 'a', installTarget: 'a' },
      { platform: 'two', aliases: ['shared'], renderer: 'markdown', target: 'b', installTarget: 'b' }
    ]
  };
  assert.throws(() => validateConfig(base), /duplicate platform or alias/);
  assert.throws(() => validateConfig({ ...base, pipelines: base.pipelines.slice(0, 1), maxEntryLines: 2 }), /maxEntryLines/);
});

test('compiler paths cannot escape the AEOS repository', () => {
  assert.throws(() => resolveProjectPath('../outside', 'test path'), /escapes the AEOS repository/);
  const config = {
    schemaVersion: 2,
    policySource: 'policies/core.json',
    knowledge: [],
    maxEntryLines: 120,
    pipelines: [
      { platform: 'unsafe', renderer: 'markdown', target: '../outside', installTarget: 'safe.md' }
    ]
  };
  assert.throws(() => validateConfig(config), /escapes the AEOS repository/);
  assert.throws(
    () => validateConfig({ ...config, pipelines: [{ ...config.pipelines[0], target: 'dist/safe', installTarget: '../outside' }] }),
    /installTarget must stay inside/
  );
});

test('policy validation rejects duplicate IDs and unsupported renderers', () => {
  const valid = {
    id: 'AEOS-TEST-001',
    title: 'Test',
    level: 'required',
    scope: 'all',
    statement: 'Test statement.',
    rationale: 'Test rationale.',
    evidence: 'Test evidence.',
    source: 'constitution/constitution.md'
  };
  assert.throws(() => validatePolicySet({
    schemaVersion: 1,
    precedence: ['host'],
    policies: [valid, { ...valid }]
  }), /duplicate policy id/);
  assert.throws(() => renderPipeline({ renderer: 'unknown' }, { policies: [], precedence: [] }), /unsupported renderer/);
});
