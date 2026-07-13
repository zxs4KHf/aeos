const fs = require('node:fs');
const path = require('node:path');

const { PROJECT_ROOT, buildOutputs, sha256 } = require('./compiler');

const INSTALL_MANIFEST = '.aeos/install-manifest.json';

function parseArgs(argv) {
  const options = { targetPath: '', platform: '', dryRun: false, force: false, knowledge: true };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (['--path', '-d'].includes(argument)) {
      if (!argv[index + 1]) throw new Error(`${argument} requires a value`);
      options.targetPath = argv[index + 1];
      index += 1;
    } else if (['--platform', '-p'].includes(argument)) {
      if (!argv[index + 1]) throw new Error(`${argument} requires a value`);
      options.platform = argv[index + 1].toLowerCase();
      index += 1;
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--force') {
      options.force = true;
    } else if (argument === '--no-knowledge') {
      options.knowledge = false;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  if (!options.targetPath) throw new Error('target project path is required (--path)');
  if (!options.platform) throw new Error('platform is required (--platform)');
  return options;
}

function normalizeRelative(relativePath) {
  return relativePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function resolveInside(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, relativePath);
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`path escapes target project: ${relativePath}`);
  }
  return resolved;
}

function assertNoSymlinkTraversal(root, destination) {
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, destination);
  let current = resolvedRoot;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`refusing to traverse symbolic link in target project: ${path.relative(resolvedRoot, current)}`);
    }
  }
}

function collectFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) throw new Error(`missing knowledge directory: ${relativeDirectory}`);
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile()) files.push(entryPath);
    }
  };
  visit(absoluteDirectory);
  return files.sort();
}

function readInstallManifest(targetRoot) {
  const manifestPath = resolveInside(targetRoot, INSTALL_MANIFEST);
  assertNoSymlinkTraversal(targetRoot, manifestPath);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) {
      throw new Error('unsupported manifest shape');
    }
    return manifest;
  } catch (error) {
    throw new Error(`cannot read existing ${INSTALL_MANIFEST}: ${error.message}`);
  }
}

function createOperations(build, includeKnowledge) {
  const operations = build.outputs.map((output) => ({
    relativePath: normalizeRelative(output.pipeline.installTarget),
    content: output.content,
    kind: 'entry'
  }));

  if (includeKnowledge) {
    for (const directory of build.config.knowledge) {
      for (const sourcePath of collectFiles(PROJECT_ROOT, directory)) {
        const sourceRelative = normalizeRelative(path.relative(PROJECT_ROOT, sourcePath));
        operations.push({
          relativePath: `.aeos/knowledge/${sourceRelative}`,
          content: fs.readFileSync(sourcePath, 'utf8'),
          kind: 'knowledge'
        });
      }
    }
  }

  const duplicate = operations.find((operation, index) => (
    operations.findIndex((candidate) => candidate.relativePath === operation.relativePath) !== index
  ));
  if (duplicate) throw new Error(`duplicate install target: ${duplicate.relativePath}`);
  return operations;
}

function classifyOperations(targetRoot, operations, previousManifest) {
  const previousHashes = new Map((previousManifest?.files || []).map((file) => [file.path, file.sha256]));
  return operations.map((operation) => {
    const destination = resolveInside(targetRoot, operation.relativePath);
    assertNoSymlinkTraversal(targetRoot, destination);
    if (!fs.existsSync(destination)) return { ...operation, destination, action: 'create' };
    const currentContent = fs.readFileSync(destination, 'utf8');
    if (currentContent === operation.content) return { ...operation, destination, action: 'unchanged' };
    const previousHash = previousHashes.get(operation.relativePath);
    if (previousHash && sha256(currentContent) === previousHash) {
      return { ...operation, destination, action: 'update' };
    }
    return { ...operation, destination, action: 'conflict' };
  });
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporaryPath, content, 'utf8');
  fs.renameSync(temporaryPath, filePath);
}

function backupConflicts(targetRoot, classified, backupId) {
  for (const operation of classified.filter((item) => item.action === 'conflict')) {
    const backupPath = resolveInside(targetRoot, `.aeos/backups/${backupId}/${operation.relativePath}`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(operation.destination, backupPath);
  }
}

function writeMemoryTemplates(targetRoot, dryRun) {
  const templateRoot = path.join(PROJECT_ROOT, 'templates', 'memory');
  const results = [];
  for (const sourcePath of collectFiles(path.join(PROJECT_ROOT, 'templates'), 'memory')) {
    const relativeName = normalizeRelative(path.relative(templateRoot, sourcePath));
    const relativePath = `.aeos/${relativeName}`;
    const destination = resolveInside(targetRoot, relativePath);
    assertNoSymlinkTraversal(targetRoot, destination);
    if (fs.existsSync(destination)) {
      results.push({ relativePath, action: 'unchanged' });
    } else {
      results.push({ relativePath, action: 'create' });
      if (!dryRun) atomicWrite(destination, fs.readFileSync(sourcePath, 'utf8'));
    }
  }
  return results;
}

function install(options) {
  const targetRoot = path.resolve(options.targetPath);
  if (!fs.existsSync(targetRoot)) throw new Error(`target project does not exist: ${targetRoot}`);
  if (fs.lstatSync(targetRoot).isSymbolicLink()) throw new Error(`target project cannot be a symbolic link: ${targetRoot}`);
  if (!fs.statSync(targetRoot).isDirectory()) throw new Error(`target path is not a directory: ${targetRoot}`);

  const build = buildOutputs(options.platform);
  const operations = createOperations(build, options.knowledge);
  const previousManifest = readInstallManifest(targetRoot);
  const classified = classifyOperations(targetRoot, operations, previousManifest);
  const conflicts = classified.filter((operation) => operation.action === 'conflict');
  if (conflicts.length > 0 && !options.force) {
    throw new Error(`refusing to overwrite unmanaged changes: ${conflicts.map((item) => item.relativePath).join(', ')}`);
  }

  const backupId = new Date().toISOString().replace(/[:.]/g, '-');
  if (!options.dryRun && conflicts.length > 0) backupConflicts(targetRoot, classified, backupId);
  if (!options.dryRun) {
    for (const operation of classified.filter((item) => item.action !== 'unchanged')) {
      atomicWrite(operation.destination, operation.content);
    }
  }

  const memoryResults = options.knowledge ? writeMemoryTemplates(targetRoot, options.dryRun) : [];
  const installedPaths = new Set(operations.map((operation) => operation.relativePath));
  const retainedFiles = (previousManifest?.files || []).filter((file) => !installedPaths.has(file.path));
  const manifest = {
    schemaVersion: 1,
    aeosVersion: require('../package.json').version,
    platforms: [...new Set([
      ...(previousManifest?.platforms || []),
      ...build.outputs.map((output) => output.pipeline.platform)
    ])].sort(),
    files: [
      ...retainedFiles,
      ...operations.map((operation) => ({
        path: operation.relativePath,
        sha256: sha256(operation.content),
        kind: operation.kind
      }))
    ].sort((left, right) => left.path.localeCompare(right.path))
  };
  if (!options.dryRun) {
    atomicWrite(resolveInside(targetRoot, INSTALL_MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  return { targetRoot, operations: classified, memoryResults, backupId: conflicts.length ? backupId : null };
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = install(options);
    for (const operation of [...result.operations, ...result.memoryResults]) {
      console.log(`${operation.action.padEnd(9)} ${operation.relativePath}`);
    }
    if (result.backupId && !options.dryRun) console.log(`Backed up conflicts to .aeos/backups/${result.backupId}/`);
    console.log(options.dryRun ? 'Dry run complete; no files were changed.' : `AEOS installed in ${result.targetRoot}`);
  } catch (error) {
    console.error(`AEOS integrator error: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  INSTALL_MANIFEST,
  classifyOperations,
  createOperations,
  install,
  parseArgs,
  assertNoSymlinkTraversal,
  resolveInside
};
