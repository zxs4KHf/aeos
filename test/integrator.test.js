const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { INSTALL_MANIFEST, diffInstall, doctor, eject, install, parseArgs, resolveInside, update } = require('../adapters/integrator');

function readManifest(projectPath) {
  return JSON.parse(fs.readFileSync(path.join(projectPath, '.aeos', 'install-manifest.json'), 'utf8'));
}

function writeManifest(projectPath, manifest) {
  fs.writeFileSync(path.join(projectPath, '.aeos', 'install-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function temporaryProject() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aeos-test-'));
}

function removeProject(projectPath) {
  fs.rmSync(projectPath, { recursive: true, force: true });
}

test('parses safe installer flags', () => {
  assert.deepEqual(parseArgs(['--path', 'demo', '--platform', 'cursor', '--dry-run', '--force', '--no-knowledge', '--json']), {
    targetPath: 'demo',
    platform: 'cursor',
    dryRun: true,
    force: true,
    knowledge: false,
    json: true,
    strict: false
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
    const byKind = { entry: 0, scoped: 0, command: 0 };
    for (const operation of result.operations) byKind[operation.kind] += 1;
    assert.equal(byKind.entry, 8);
    assert.ok(byKind.scoped >= 4);
    assert.equal(byKind.command, 3);
    assert.equal(new Set(result.operations.map((operation) => operation.relativePath)).size, result.operations.length);
    assert.equal(fs.existsSync(path.join(projectPath, 'AGENTS.md')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.github', 'copilot-instructions.md')), true);
  } finally {
    removeProject(projectPath);
  }
});

test('renders scoped rules for policies with appliesTo globs', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'cursor', dryRun: false, force: false, knowledge: false });
    const scoped = fs.readFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-deps-001.mdc'), 'utf8');
    assert.match(scoped, /globs: .*package\.json/);
    assert.match(scoped, /alwaysApply: false/);
    assert.match(scoped, /AEOS-DEPS-001/);

    install({ targetPath: projectPath, platform: 'copilot', dryRun: false, force: false, knowledge: false });
    const copilotScoped = fs.readFileSync(path.join(projectPath, '.github', 'instructions', 'aeos-docs-001.instructions.md'), 'utf8');
    assert.match(copilotScoped, /^---\napplyTo: "/);
    assert.match(copilotScoped, /AEOS-DOCS-001/);
  } finally {
    removeProject(projectPath);
  }
});

test('compiles workflows into Claude command prompts', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'claude', dryRun: false, force: false, knowledge: false });
    const commandsDir = path.join(projectPath, '.claude', 'commands');
    const names = fs.readdirSync(commandsDir).sort();
    assert.deepEqual(names, ['aeos-development.md', 'aeos-incident-response.md', 'aeos-review-sync.md']);
    const command = fs.readFileSync(path.join(commandsDir, 'aeos-development.md'), 'utf8');
    assert.match(command, /^---\ndescription: /);
    assert.match(command, /\$ARGUMENTS/);
  } finally {
    removeProject(projectPath);
  }
});

test('import collects existing instruction files and entries link them', () => {
  const projectPath = temporaryProject();
  try {
    fs.writeFileSync(path.join(projectPath, 'CLAUDE.md'), 'Always use tabs.\n', 'utf8');
    fs.mkdirSync(path.join(projectPath, '.cursor', 'rules'), { recursive: true });
    fs.writeFileSync(path.join(projectPath, '.cursor', 'rules', 'style.mdc'), 'Prefer small diffs.\n', 'utf8');

    const { importInstructions } = require('../adapters/integrator');
    const result = importInstructions({ targetPath: projectPath, dryRun: false });
    assert.deepEqual(result.imported.sort(), ['.cursor/rules/style.mdc', 'CLAUDE.md']);
    assert.deepEqual(result.conflicts, ['CLAUDE.md']);
    const imported = fs.readFileSync(path.join(projectPath, '.aeos', 'IMPORTED.md'), 'utf8');
    assert.match(imported, /## From `CLAUDE\.md`/);
    assert.match(imported, /Always use tabs\./);

    const second = importInstructions({ targetPath: projectPath, dryRun: false });
    assert.equal(second.imported.length, 0);
    assert.ok(second.skipped.some((entry) => entry.reason === 'already-imported'));

    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    const entry = fs.readFileSync(path.join(projectPath, 'AGENTS.md'), 'utf8');
    assert.match(entry, /Imported repository instructions: `\.aeos\/IMPORTED\.md`/);

    const report = require('../adapters/integrator').doctor({ targetPath: projectPath });
    assert.equal(report.healthy, true);
  } finally {
    removeProject(projectPath);
  }
});

test('import skips AEOS-generated files', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    const { importInstructions } = require('../adapters/integrator');
    const result = importInstructions({ targetPath: projectPath, dryRun: false });
    assert.equal(result.imported.length, 0);
    assert.ok(result.skipped.some((entry) => entry.relativePath === 'AGENTS.md' && entry.reason === 'aeos-generated'));
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'IMPORTED.md')), false);
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

test('renders pointer entries for AGENTS.md-aware platforms when the canonical entry is installed', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'all', dryRun: false, force: false, knowledge: false });
    const claude = fs.readFileSync(path.join(projectPath, 'CLAUDE.md'), 'utf8');
    const cursor = fs.readFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc'), 'utf8');
    const gemini = fs.readFileSync(path.join(projectPath, 'GEMINI.md'), 'utf8');
    assert.match(claude, /canonical AEOS entry is `AGENTS\.md`/);
    assert.doesNotMatch(claude, /AEOS-CONTEXT-001/);
    assert.match(cursor, /alwaysApply: true/);
    assert.match(cursor, /canonical AEOS entry is `AGENTS\.md`/);
    assert.match(gemini, /AEOS-CONTEXT-001/);
  } finally {
    removeProject(projectPath);
  }
});

test('renders full entries when the canonical platform is not part of the install', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'claude', dryRun: false, force: false, knowledge: false });
    assert.match(fs.readFileSync(path.join(projectPath, 'CLAUDE.md'), 'utf8'), /AEOS-CONTEXT-001/);

    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    assert.match(fs.readFileSync(path.join(projectPath, 'CLAUDE.md'), 'utf8'), /canonical AEOS entry/);
    const afterCanonical = doctor({ targetPath: projectPath });
    assert.equal(afterCanonical.updatesPending, false);
    const cursorResult = install({ targetPath: projectPath, platform: 'cursor', dryRun: false, force: false, knowledge: false });
    assert.equal(cursorResult.operations[0].action, 'create');
    assert.match(fs.readFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc'), 'utf8'), /canonical AEOS entry/);
  } finally {
    removeProject(projectPath);
  }
});

test('update prunes clean orphaned files and drops them from the manifest', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    const orphanRelative = 'retired/OLD_ENTRY.md';
    const orphanPath = path.join(projectPath, 'retired', 'OLD_ENTRY.md');
    fs.mkdirSync(path.dirname(orphanPath), { recursive: true });
    fs.writeFileSync(orphanPath, 'retired content\n', 'utf8');
    const manifest = readManifest(projectPath);
    const crypto = require('node:crypto');
    manifest.files.push({
      path: orphanRelative,
      sha256: crypto.createHash('sha256').update('retired content\n').digest('hex'),
      kind: 'entry'
    });
    writeManifest(projectPath, manifest);

    const result = update({ targetPath: projectPath, dryRun: false, force: false });
    assert.deepEqual(result.pruneResults, [{ relativePath: orphanRelative, action: 'prune' }]);
    assert.equal(fs.existsSync(orphanPath), false);
    assert.equal(fs.existsSync(path.dirname(orphanPath)), false);
    assert.ok(readManifest(projectPath).files.every((file) => file.path !== orphanRelative));
  } finally {
    removeProject(projectPath);
  }
});

test('update keeps modified orphaned files but stops tracking them', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    const orphanPath = path.join(projectPath, 'stale.md');
    fs.writeFileSync(orphanPath, 'user edited\n', 'utf8');
    const manifest = readManifest(projectPath);
    manifest.files.push({ path: 'stale.md', sha256: 'not-the-current-hash', kind: 'entry' });
    writeManifest(projectPath, manifest);

    const result = update({ targetPath: projectPath, dryRun: false, force: false });
    assert.deepEqual(result.pruneResults, [{ relativePath: 'stale.md', action: 'orphan-kept' }]);
    assert.equal(fs.readFileSync(orphanPath, 'utf8'), 'user edited\n');
    assert.ok(readManifest(projectPath).files.every((file) => file.path !== 'stale.md'));
  } finally {
    removeProject(projectPath);
  }
});

test('doctor reports healthy installs and detects drift', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: true });
    const healthy = doctor({ targetPath: projectPath });
    assert.equal(healthy.healthy, true);
    assert.equal(healthy.updatesPending, false);
    assert.ok(healthy.entries.every((entry) => entry.status === 'ok'));

    fs.appendFileSync(path.join(projectPath, 'AGENTS.md'), 'local tweak\n', 'utf8');
    fs.rmSync(path.join(projectPath, '.aeos', 'knowledge', 'constitution', 'constitution.md'));
    const drifted = doctor({ targetPath: projectPath });
    assert.equal(drifted.healthy, false);
    const byPath = new Map(drifted.entries.map((entry) => [entry.relativePath, entry.status]));
    assert.equal(byPath.get('AGENTS.md'), 'modified');
    assert.equal(byPath.get('.aeos/knowledge/constitution/constitution.md'), 'missing');
  } finally {
    removeProject(projectPath);
  }
});

test('diff previews pending changes without writing anything', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'codex', dryRun: false, force: false, knowledge: false });
    const current = diffInstall({ targetPath: projectPath });
    assert.ok(current.operations.every((operation) => operation.action === 'unchanged'));
    assert.equal(current.orphans.length, 0);

    fs.rmSync(path.join(projectPath, 'AGENTS.md'));
    const pending = diffInstall({ targetPath: projectPath });
    assert.equal(pending.operations.find((operation) => operation.relativePath === 'AGENTS.md').action, 'create');
    assert.equal(fs.existsSync(path.join(projectPath, 'AGENTS.md')), false);
  } finally {
    removeProject(projectPath);
  }
});

test('eject removes managed files, keeps project facts, and preserves modified files without force', () => {
  const projectPath = temporaryProject();
  try {
    install({ targetPath: projectPath, platform: 'cursor', dryRun: false, force: false, knowledge: true });
    fs.appendFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc'), 'local tweak\n', 'utf8');

    const kept = eject({ targetPath: projectPath, dryRun: false, force: false });
    assert.ok(kept.results.some((entry) => entry.action === 'kept-modified'));
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'knowledge')), false);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'install-manifest.json')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'PROJECT_CONTEXT.md')), true);

    const forced = eject({ targetPath: projectPath, dryRun: false, force: true });
    assert.ok(forced.results.some((entry) => entry.action === 'remove'));
    assert.ok(forced.backupId);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc')), false);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'install-manifest.json')), false);
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
