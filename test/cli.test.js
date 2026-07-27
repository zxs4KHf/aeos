const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const CLI = path.join(__dirname, '..', 'bin', 'aeos.js');

function runCli(args) {
  const result = spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function temporaryProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'aeos-cli-test-'));
  fs.writeFileSync(path.join(projectPath, 'package.json'), '{"name":"fixture"}\n', 'utf8');
  return projectPath;
}

function removeProject(projectPath) {
  fs.rmSync(projectPath, { recursive: true, force: true });
}

test('cli prints usage and version', () => {
  const help = runCli([]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage: aeos <command>/);

  const version = runCli(['version']);
  assert.equal(version.status, 0);
  assert.match(version.stdout.trim(), /^\d+\.\d+\.\d+/);

  const unknown = runCli(['frobnicate']);
  assert.equal(unknown.status, 1);
  assert.match(unknown.stderr, /unknown command/);
});

test('cli end-to-end: init, doctor, drift detection, update, and eject on a fixture project', () => {
  const projectPath = temporaryProject();
  try {
    const dryRun = runCli(['init', '--path', projectPath, '--platform', 'cursor', '--dry-run']);
    assert.equal(dryRun.status, 0);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor')), false);

    const init = runCli(['init', '--path', projectPath, '--platform', 'cursor']);
    assert.equal(init.status, 0, init.stderr);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'install-manifest.json')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'PROJECT_CONTEXT.md')), true);

    const healthy = runCli(['doctor', '--path', projectPath]);
    assert.equal(healthy.status, 0, healthy.stdout);
    assert.match(healthy.stdout, /healthy and current/);

    fs.appendFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc'), 'local tweak\n', 'utf8');
    const drifted = runCli(['doctor', '--path', projectPath]);
    assert.equal(drifted.status, 1);
    assert.match(drifted.stdout, /modified/);

    const diff = runCli(['diff', '--path', projectPath]);
    assert.equal(diff.status, 0);
    assert.match(diff.stdout, /conflict/);

    const blockedUpdate = runCli(['update', '--path', projectPath]);
    assert.equal(blockedUpdate.status, 1);
    assert.match(blockedUpdate.stderr, /refusing to overwrite unmanaged changes/);

    const forcedUpdate = runCli(['update', '--path', projectPath, '--force']);
    assert.equal(forcedUpdate.status, 0, forcedUpdate.stderr);
    const restored = runCli(['doctor', '--path', projectPath]);
    assert.equal(restored.status, 0, restored.stdout);

    fs.writeFileSync(path.join(projectPath, 'GEMINI.md'), 'Legacy Gemini notes.\n', 'utf8');
    const imported = runCli(['import', '--path', projectPath]);
    assert.equal(imported.status, 0, imported.stderr);
    assert.match(imported.stdout, /GEMINI\.md/);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'IMPORTED.md')), true);

    const pendingImport = runCli(['doctor', '--path', projectPath]);
    assert.equal(pendingImport.status, 0, pendingImport.stdout);
    assert.match(pendingImport.stdout, /update-available/);
    const strictPendingImport = runCli(['doctor', '--path', projectPath, '--json', '--strict']);
    assert.equal(strictPendingImport.status, 1, strictPendingImport.stdout);
    assert.equal(JSON.parse(strictPendingImport.stdout).updatesPending, true);

    const applyImport = runCli(['update', '--path', projectPath]);
    assert.equal(applyImport.status, 0, applyImport.stderr);
    assert.match(fs.readFileSync(path.join(projectPath, '.cursor', 'rules', 'aeos-core.mdc'), 'utf8'), /IMPORTED\.md/);

    const eject = runCli(['eject', '--path', projectPath]);
    assert.equal(eject.status, 0, eject.stderr);
    assert.equal(fs.existsSync(path.join(projectPath, '.cursor')), false);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'install-manifest.json')), false);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'PROJECT_CONTEXT.md')), true);
    assert.equal(fs.existsSync(path.join(projectPath, '.aeos', 'IMPORTED.md')), true);
    assert.equal(fs.existsSync(path.join(projectPath, 'package.json')), true);
  } finally {
    removeProject(projectPath);
  }
});

test('cli check verifies committed artifacts without touching the target project', () => {
  const check = runCli(['check']);
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /AEOS check passed/);
});

test('GitHub automation uses strict verification, safe input transport, and a Windows CI matrix', () => {
  const action = fs.readFileSync(path.join(__dirname, '..', 'action.yml'), 'utf8');
  const runScript = action.slice(action.indexOf('      run: |'));
  assert.doesNotMatch(runScript, /\$\{\{\s*inputs\./);
  assert.match(runScript, /doctor --path "\$AEOS_TARGET_PATH" --json --strict/);
  assert.match(runScript, /target path must stay inside GITHUB_WORKSPACE/);

  const ci = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'ci.yml'), 'utf8');
  assert.match(ci, /os: \[ubuntu-latest, windows-latest\]/);
  assert.match(ci, /runs-on: \$\{\{ matrix\.os \}\}/);

  const attributes = fs.readFileSync(path.join(__dirname, '..', '.gitattributes'), 'utf8');
  for (const extension of ['js', 'json', 'md', 'mdc', 'yaml', 'yml']) {
    assert.match(attributes, new RegExp(`\\*\\.${extension} text eol=lf`));
  }
});
