const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { install, parseArgs, resolveInside } = require('../adapters/integrator');

function temporaryProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aeos-test-'));
}

function removeProject(projectPath) {
  fs.rmSync(projectPath, { recursive: true, force: true });
}

test('parses safe installer flags', () => {
  assert.deepEqual(parseArgs(['--path', 'demo', '--platform', 'cursor', '--dry-run', '--force', '--no-knowledge']), {
    targetPath: 'demo',
    platform: 'cursor',
    dryRun: true,
    force: true,
    knowledge: false
  });
  assert.throws(() => parseArgs(['--platform', 'cursor']), /target project path/);
});

test('prevents install paths from escaping the target project', () => {
  const projectPath = temporaryProject();
  try {
    assert.throws(() => resolveInside(projectPath, '../outside'), /escapes target project/);
  } finally {
    removeProject(projectPath);
  }
});

test('dry-run reports operations without writing files', () => {
  const projectPath = temporaryProject();
  try {
    const result = install({ targetPath: projectPath, platform: 'cursor', dryRun: true, force: false, knowledge: true });
    assert.ok(result.operations.length > 10);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor')), false);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos')), false);
  } finally {
    removeProject(projectPath);
  }
});

test('installs and safely updates AEOS-managed files', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: true });
    assert.equal(fs.existsSync(path.join(projectPath, 'AGENTS.md')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'install-manifest.json')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'PROJECT_CONTEXT.md')), true);

    const second = install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: true });
    assert.ok(second.operations.every((operation) => operation.action === 'unchanged'));
  } finally {
    removeProject(projectPath);
  }
});

test('installs every platform without target collisions', () => {
  const projectPath = temporaryProject();
  try {
    const result = install({ targetPath: projectPath, platform: 'all', dryRun: false, force: false, knowledge: false });
    assert.equal(result.operations.length, 8);
    assert.equal(new Set(result.operations.map((operation) => operation.relativePath)).size, 8);
    assert.equal(fs.existsSync(path.join(projectPath, 'AGENTS.md')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.github', 'copilot-instructions.md')), true);
  } finally {
    removeProject(projectPath);
  }
});

test('preserves ownership when platforms are installed incrementally', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'cursor', dryRun: false, force: false, knowledge: false });
    install({ targetPath: projectPath, platform: 'claude', dryRun: false, force: false, knowledge: false });
    const manifest = JSON.parse(fs.readFileSync(path.join(projectPath, '.aeos', 'install-manifest.json'), 'utf8'));
    assert.deepEqual(manifest.platforms, ['claude', 'cursor']);
    assert.ok(manifest.files.some((file) => file.path === '.cursor/rules/aeos-core.mdc'));
    assert.ok(manifest.files.some((file) => file.path === 'CLAUDE.md'));
  } finally {
    removeProject(projectPath);
  }
});

test('refuses unmanaged changes unless force is used, then backs them up', () => {
  const projectPath = temporaryProject();
  try {
    fs.writeFileSync(path.join(projectPath, 'AGENTS.md'), 'user-owned instructions\n', 'utf8');
    const options = { targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false };
    assert.throws(() => install(options), /refusing to overwrite unmanaged changes/);
    assert.equal(fs.readFileSync(path.join(projectPath, 'AGENTS.md'), 'utf8'), 'user-owned instructions\n');

    const result = install({ ...options, force: true });
    const backupPath = path.join(projectPath, '.aeos', 'backups', result.backupId, 'AGENTS.md');
    assert.equal(fs.readFileSync(backupPath, 'utf8'), 'user-owned instructions\n');
    assert.match(fs.readFileSync(path.join(projectPath, 'AGENTS.md'), 'utf8'), /AEOS Project Instructions/);
  } finally {
    removeProject(projectPath);
  }
});
