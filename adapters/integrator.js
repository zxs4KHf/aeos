const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const {
  GENERATED_MARKER,
  PROJECT_ROOT,
  buildOutputs,
  renderCommand,
  renderPointer,
  renderScopedRule,
  scopedRuleTarget,
  sha256
} = require('./compiler');

const INSTALL_MANIFEST = '.aeos/install-manifest.json';
const IMPORTED_FILE = '.aeos/IMPORTED.md';
const IMPORTED_LINE = '- Imported repository instructions: `.aeos/IMPORTED.md`';
const TARGET_FLAGS = new Set(['--dry-run', '--force', '--no-knowledge', '--json', '--strict']);
const MANAGED_KINDS = new Set(['entry', 'scoped', 'command', 'knowledge']);

function parseTargetArgs(argv, {
  requirePlatform = false,
  allowPlatform = true,
  allowedFlags = [...TARGET_FLAGS]
} = {}) {
  const enabledFlags = new Set(allowedFlags);
  const options = {
    targetPath: '', platform: '', dryRun: false, force: false, knowledge: true, json: false, strict: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (['--path', '-d'].includes(argument)) {
      if (!argv[index + 1]) throw new Error(`${argument} requires a value`);
      options.targetPath = argv[index + 1];
      index += 1;
    } else if (allowPlatform && ['--platform', '-p'].includes(argument)) {
      if (!argv[index + 1]) throw new Error(`${argument} requires a value`);
      options.platform = argv[index + 1].toLowerCase();
      index += 1;
    } else if (TARGET_FLAGS.has(argument) && !enabledFlags.has(argument)) {
      throw new Error(`${argument} is not supported for this command`);
    } else if (argument === '--dry-run') {
      options.dryRun = true;
    } else if (argument === '--force') {
      options.force = true;
    } else if (argument === '--no-knowledge') {
      options.knowledge = false;
    } else if (argument === '--json') {
      options.json = true;
    } else if (argument === '--strict') {
      options.strict = true;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
  if (!options.targetPath) throw new Error('target project path is required (--path)');
  if (requirePlatform && !options.platform) throw new Error('platform is required (--platform)');
  return options;
}

function parseArgs(argv) {
  return parseTargetArgs(argv, { requirePlatform: true });
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

function resolveTargetRoot(targetPath) {
  const targetRoot = path.resolve(targetPath);
  if (!fs.existsSync(targetRoot)) throw new Error(`target project does not exist: ${targetRoot}`);
  if (fs.lstatSync(targetRoot).isSymbolicLink()) throw new Error(`target project cannot be a symbolic link: ${targetRoot}`);
  if (!fs.statSync(targetRoot).isDirectory()) throw new Error(`target path is not a directory: ${targetRoot}`);
  return targetRoot;
}

function resolvePlatformNames(build, requestedPlatform) {
  if (requestedPlatform === 'all') return build.config.pipelines.map((pipeline) => pipeline.platform);
  const pipeline = build.config.pipelines.find((candidate) => (
    candidate.platform === requestedPlatform || (candidate.aliases || []).includes(requestedPlatform)
  ));
  if (!pipeline) {
    const supported = build.config.pipelines.map((candidate) => candidate.platform).join(', ');
    throw new Error(`unknown platform "${requestedPlatform}"; supported: ${supported}, all`);
  }
  return [pipeline.platform];
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
    return validateInstallManifest(manifest);
  } catch (error) {
    throw new Error(`cannot read existing ${INSTALL_MANIFEST}: ${error.message}`);
  }
}

function validateInstallManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.platforms) || !Array.isArray(manifest.files)) {
    throw new Error('unsupported manifest shape');
  }
  if (manifest.platforms.some((platform) => typeof platform !== 'string' || !platform)
    || new Set(manifest.platforms).size !== manifest.platforms.length) {
    throw new Error('manifest platforms must be unique non-empty strings');
  }
  const paths = new Set();
  for (const file of manifest.files) {
    if (!file || typeof file.path !== 'string' || !file.path || path.isAbsolute(file.path)
      || /^[a-z]:/i.test(file.path) || file.path.includes('\\') || file.path.split('/').includes('..')
      || ['.', INSTALL_MANIFEST].includes(file.path) || /[\r\n\0]/.test(file.path)) {
      throw new Error(`invalid managed path: ${file?.path ?? '<missing>'}`);
    }
    const pathKey = file.path.toLowerCase();
    if (paths.has(pathKey)) throw new Error(`duplicate managed path: ${file.path}`);
    paths.add(pathKey);
    if (typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)) {
      throw new Error(`invalid managed hash for ${file.path}`);
    }
    if (!MANAGED_KINDS.has(file.kind)) throw new Error(`invalid managed kind for ${file.path}: ${file.kind}`);
  }
  return manifest;
}

function injectImportedLine(content) {
  return content.replace('## Knowledge Map\n\n', `## Knowledge Map\n\n${IMPORTED_LINE}\n`);
}

function createOperations(build, { platformNames, includeKnowledge, pointerActive, importedPresent }) {
  const canonicalPipeline = build.config.pipelines.find((pipeline) => pipeline.canonical);
  const selected = build.outputs.filter((output) => platformNames.includes(output.pipeline.platform));
  const operations = selected.map((output) => {
    let content = pointerActive && output.pipeline.readsAgentsMd && canonicalPipeline
      ? renderPointer(output.pipeline, normalizeRelative(canonicalPipeline.installTarget))
      : output.content;
    if (importedPresent) content = injectImportedLine(content);
    return {
      relativePath: normalizeRelative(output.pipeline.installTarget),
      content,
      kind: 'entry'
    };
  });

  for (const output of selected) {
    if (output.pipeline.scopedRules) {
      for (const policy of build.policySet.policies.filter((candidate) => candidate.appliesTo)) {
        operations.push({
          relativePath: normalizeRelative(scopedRuleTarget(output.pipeline, policy)),
          content: renderScopedRule(output.pipeline, policy),
          kind: 'scoped'
        });
      }
    }
    if (output.pipeline.commands) {
      const commandsTarget = normalizeRelative(output.pipeline.commandsTarget || '.claude/commands');
      for (const workflowPath of collectFiles(PROJECT_ROOT, 'workflows')) {
        const slug = path.basename(workflowPath, path.extname(workflowPath))
          .replace(/_workflow$/, '')
          .replace(/_/g, '-');
        operations.push({
          relativePath: `${commandsTarget}/aeos-${slug}.md`,
          content: renderCommand(slug, fs.readFileSync(workflowPath, 'utf8')),
          kind: 'command'
        });
      }
    }
  }

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

function classifyOrphans(targetRoot, previousManifest, expectedPaths) {
  return (previousManifest?.files || [])
    .filter((file) => !expectedPaths.has(file.path))
    .map((file) => {
      const destination = resolveInside(targetRoot, file.path);
      assertNoSymlinkTraversal(targetRoot, destination);
      if (!fs.existsSync(destination)) return { relativePath: file.path, destination, action: 'prune-missing' };
      const currentContent = fs.readFileSync(destination, 'utf8');
      if (sha256(currentContent) === file.sha256) return { relativePath: file.path, destination, action: 'prune' };
      return { relativePath: file.path, destination, action: 'prune-conflict' };
    });
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${randomUUID()}`;
  try {
    fs.writeFileSync(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporaryPath, filePath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath, { force: true });
  }
}

function backupFile(targetRoot, relativePath, sourcePath, backupId) {
  const backupPath = resolveInside(targetRoot, `.aeos/backups/${backupId}/${relativePath}`);
  assertNoSymlinkTraversal(targetRoot, backupPath);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(sourcePath, backupPath);
}

function removeEmptyParents(targetRoot, filePath) {
  const resolvedRoot = path.resolve(targetRoot);
  let current = path.dirname(filePath);
  while (current !== resolvedRoot && current.startsWith(`${resolvedRoot}${path.sep}`)) {
    if (!fs.existsSync(current) || fs.readdirSync(current).length > 0) return;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function applyMutationTransaction(targetRoot, mutations) {
  const destinations = new Set();
  const snapshots = mutations.map((mutation) => {
    assertNoSymlinkTraversal(targetRoot, mutation.destination);
    const key = mutation.destination.toLowerCase();
    if (destinations.has(key)) throw new Error(`duplicate transaction destination: ${mutation.relativePath}`);
    destinations.add(key);
    if (!fs.existsSync(mutation.destination)) return { mutation, existed: false, content: null };
    if (!fs.statSync(mutation.destination).isFile()) {
      throw new Error(`transaction destination is not a file: ${mutation.relativePath}`);
    }
    return { mutation, existed: true, content: fs.readFileSync(mutation.destination) };
  });

  try {
    for (const mutation of mutations) {
      if (mutation.action === 'write') atomicWrite(mutation.destination, mutation.content);
      else if (mutation.action === 'remove' && fs.existsSync(mutation.destination)) {
        fs.rmSync(mutation.destination);
        removeEmptyParents(targetRoot, mutation.destination);
      } else if (!['write', 'remove'].includes(mutation.action)) {
        throw new Error(`unsupported transaction action: ${mutation.action}`);
      }
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const snapshot of snapshots.reverse()) {
      try {
        if (snapshot.existed) atomicWrite(snapshot.mutation.destination, snapshot.content);
        else if (fs.existsSync(snapshot.mutation.destination)) fs.rmSync(snapshot.mutation.destination, { force: true });
        if (!snapshot.existed) removeEmptyParents(targetRoot, snapshot.mutation.destination);
      } catch (rollbackError) {
        rollbackErrors.push(`${snapshot.mutation.relativePath}: ${rollbackError.message}`);
      }
    }
    const suffix = rollbackErrors.length > 0 ? `; rollback errors: ${rollbackErrors.join('; ')}` : '';
    throw new Error(`managed-file transaction failed: ${error.message}${suffix}`);
  }
}

function planMemoryTemplates(targetRoot) {
  const templateRoot = path.join(PROJECT_ROOT, 'templates', 'memory');
  const results = [];
  for (const sourcePath of collectFiles(path.join(PROJECT_ROOT, 'templates'), 'memory')) {
    const relativeName = normalizeRelative(path.relative(templateRoot, sourcePath));
    const relativePath = `.aeos/${relativeName}`;
    const destination = resolveInside(targetRoot, relativePath);
    assertNoSymlinkTraversal(targetRoot, destination);
    if (fs.existsSync(destination)) {
      results.push({ relativePath, destination, action: 'unchanged', content: null });
    } else {
      results.push({
        relativePath,
        destination,
        action: 'create',
        content: fs.readFileSync(sourcePath, 'utf8')
      });
    }
  }
  return results;
}

function planInstall(targetRoot, requestedNames, includeKnowledge) {
  const build = buildOutputs('all');
  const previousManifest = readInstallManifest(targetRoot);
  const knownNames = new Set(build.config.pipelines.map((pipeline) => pipeline.platform));
  const keptPrevious = (previousManifest?.platforms || []).filter((name) => knownNames.has(name));
  const droppedPlatforms = (previousManifest?.platforms || []).filter((name) => !knownNames.has(name));
  const unionNames = [...new Set([...keptPrevious, ...requestedNames])];
  const knowledgePreviously = (previousManifest?.files || []).some((file) => file.kind === 'knowledge');
  const canonicalPipeline = build.config.pipelines.find((pipeline) => pipeline.canonical);
  const pointerActive = Boolean(canonicalPipeline && unionNames.includes(canonicalPipeline.platform));
  const importedPresent = fs.existsSync(resolveInside(targetRoot, IMPORTED_FILE));

  const requestedOperations = createOperations(build, {
    platformNames: requestedNames,
    includeKnowledge,
    pointerActive,
    importedPresent
  });
  const expectedOperations = createOperations(build, {
    platformNames: unionNames,
    includeKnowledge: includeKnowledge || knowledgePreviously,
    pointerActive,
    importedPresent
  });
  const requestedPaths = new Set(requestedOperations.map((operation) => operation.relativePath));
  const previousByPath = new Map((previousManifest?.files || []).map((file) => [file.path, file]));
  const operationsToApply = expectedOperations.filter((operation) => {
    if (requestedPaths.has(operation.relativePath)) return true;
    const previous = previousByPath.get(operation.relativePath);
    return !previous || previous.sha256 !== sha256(operation.content) || previous.kind !== operation.kind;
  });
  const expectedPaths = new Set(expectedOperations.map((operation) => operation.relativePath));

  return {
    build,
    previousManifest,
    unionNames,
    knowledgePreviously,
    droppedPlatforms,
    classified: classifyOperations(targetRoot, operationsToApply, previousManifest),
    orphans: classifyOrphans(targetRoot, previousManifest, expectedPaths),
    expectedOperations
  };
}

function installCore(targetRoot, requestedNames, options) {
  const plan = planInstall(targetRoot, requestedNames, options.knowledge);
  const conflicts = plan.classified.filter((operation) => operation.action === 'conflict');
  if (conflicts.length > 0 && !options.force) {
    throw new Error(`refusing to overwrite unmanaged changes: ${conflicts.map((item) => item.relativePath).join(', ')}`);
  }

  const forcedOrphans = options.force
    ? plan.orphans.filter((orphan) => orphan.action === 'prune-conflict')
    : [];
  const needsBackup = conflicts.length > 0 || forcedOrphans.length > 0;
  const backupId = new Date().toISOString().replace(/[:.]/g, '-');

  const pruneResults = plan.orphans.map((orphan) => {
    if (orphan.action === 'prune') return { relativePath: orphan.relativePath, action: 'prune' };
    if (orphan.action === 'prune-missing') return { relativePath: orphan.relativePath, action: 'prune-missing' };
    return options.force
      ? { relativePath: orphan.relativePath, action: 'prune' }
      : { relativePath: orphan.relativePath, action: 'orphan-kept' };
  });

  const memoryPlan = options.knowledge ? planMemoryTemplates(targetRoot) : [];
  const memoryResults = memoryPlan.map(({ relativePath, action }) => ({ relativePath, action }));
  const requestedPaths = new Set(plan.classified.map((operation) => operation.relativePath));
  const orphanPaths = new Set(plan.orphans.map((orphan) => orphan.relativePath));
  const retainedFiles = (plan.previousManifest?.files || []).filter((file) => (
    !requestedPaths.has(file.path) && !orphanPaths.has(file.path)
  ));
  const manifest = {
    schemaVersion: 1,
    aeosVersion: require('../package.json').version,
    platforms: plan.unionNames.slice().sort(),
    files: [
      ...retainedFiles,
      ...plan.classified.map((operation) => ({
        path: operation.relativePath,
        sha256: sha256(operation.content),
        kind: operation.kind
      }))
    ].sort((left, right) => left.path.localeCompare(right.path))
  };
  if (!options.dryRun) {
    for (const operation of conflicts) backupFile(targetRoot, operation.relativePath, operation.destination, backupId);
    for (const orphan of forcedOrphans) backupFile(targetRoot, orphan.relativePath, orphan.destination, backupId);
    const manifestPath = resolveInside(targetRoot, INSTALL_MANIFEST);
    const mutations = [
      ...plan.classified
        .filter((operation) => operation.action !== 'unchanged')
        .map((operation) => ({
          relativePath: operation.relativePath,
          destination: operation.destination,
          action: 'write',
          content: operation.content
        })),
      ...plan.orphans
        .filter((orphan) => orphan.action === 'prune' || (options.force && orphan.action === 'prune-conflict'))
        .map((orphan) => ({
          relativePath: orphan.relativePath,
          destination: orphan.destination,
          action: 'remove'
        })),
      ...memoryPlan
        .filter((operation) => operation.action === 'create')
        .map((operation) => ({
          relativePath: operation.relativePath,
          destination: operation.destination,
          action: 'write',
          content: operation.content
        })),
      {
        relativePath: INSTALL_MANIFEST,
        destination: manifestPath,
        action: 'write',
        content: `${JSON.stringify(manifest, null, 2)}\n`
      }
    ];
    applyMutationTransaction(targetRoot, mutations);
  }

  return {
    targetRoot,
    operations: plan.classified,
    pruneResults,
    memoryResults,
    droppedPlatforms: plan.droppedPlatforms,
    backupId: needsBackup ? backupId : null
  };
}

function install(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const build = buildOutputs('all');
  const requestedNames = resolvePlatformNames(build, options.platform);
  return installCore(targetRoot, requestedNames, options);
}

function readInstalledState(targetRoot) {
  const previousManifest = readInstallManifest(targetRoot);
  if (!previousManifest) throw new Error(`AEOS is not installed here (missing ${INSTALL_MANIFEST}); run init first`);
  const build = buildOutputs('all');
  const knownNames = new Set(build.config.pipelines.map((pipeline) => pipeline.platform));
  const platformNames = (previousManifest.platforms || []).filter((name) => knownNames.has(name));
  if (platformNames.length === 0) throw new Error('no known platforms recorded in the install manifest');
  const knowledge = (previousManifest.files || []).some((file) => file.kind === 'knowledge');
  return { build, previousManifest, platformNames, knowledge };
}

function update(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const state = readInstalledState(targetRoot);
  return installCore(targetRoot, state.platformNames, { ...options, knowledge: state.knowledge });
}

function diffInstall(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const state = readInstalledState(targetRoot);
  const plan = planInstall(targetRoot, state.platformNames, state.knowledge);
  return {
    targetRoot,
    operations: plan.classified,
    orphans: plan.orphans,
    droppedPlatforms: plan.droppedPlatforms
  };
}

function doctor(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const state = readInstalledState(targetRoot);
  const { build, previousManifest: manifest, platformNames, knowledge } = state;
  const canonicalPipeline = build.config.pipelines.find((pipeline) => pipeline.canonical);
  const pointerActive = Boolean(canonicalPipeline && platformNames.includes(canonicalPipeline.platform));
  const importedPresent = fs.existsSync(resolveInside(targetRoot, IMPORTED_FILE));
  const expectedOperations = createOperations(build, {
    platformNames,
    includeKnowledge: knowledge,
    pointerActive,
    importedPresent
  });
  const expectedByPath = new Map(expectedOperations.map((operation) => [operation.relativePath, operation]));
  const manifestPaths = new Set(manifest.files.map((file) => file.path));

  const entries = manifest.files.map((file) => {
    const destination = resolveInside(targetRoot, file.path);
    assertNoSymlinkTraversal(targetRoot, destination);
    const expected = expectedByPath.get(file.path);
    if (!fs.existsSync(destination)) {
      return { relativePath: file.path, status: expected ? 'missing' : 'prunable' };
    }
    const currentContent = fs.readFileSync(destination, 'utf8');
    const clean = sha256(currentContent) === file.sha256;
    if (!expected) return { relativePath: file.path, status: clean ? 'prunable' : 'orphaned-modified' };
    if (!clean) return { relativePath: file.path, status: 'modified' };
    return { relativePath: file.path, status: currentContent === expected.content ? 'ok' : 'update-available' };
  });

  for (const operation of expectedOperations) {
    if (manifestPaths.has(operation.relativePath)) continue;
    const destination = resolveInside(targetRoot, operation.relativePath);
    assertNoSymlinkTraversal(targetRoot, destination);
    entries.push({
      relativePath: operation.relativePath,
      status: fs.existsSync(destination) ? 'unmanaged-conflict' : 'new'
    });
  }

  const issues = entries.filter((entry) => ['modified', 'missing', 'orphaned-modified', 'unmanaged-conflict'].includes(entry.status));
  const updates = entries.filter((entry) => ['update-available', 'new', 'prunable'].includes(entry.status));
  return {
    targetRoot,
    aeosVersion: manifest.aeosVersion || 'unknown',
    platforms: platformNames,
    entries,
    issues,
    healthy: issues.length === 0,
    updatesPending: updates.length > 0
  };
}

const IMPORT_ROOT_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.cursorrules',
  '.windsurfrules',
  '.github/copilot-instructions.md'
];
const IMPORT_DIRECTORIES = ['.cursor/rules', '.clinerules', '.github/instructions'];

function collectImportSources(targetRoot) {
  const candidates = [...IMPORT_ROOT_FILES];
  for (const directory of IMPORT_DIRECTORIES) {
    const absolute = resolveInside(targetRoot, directory);
    assertNoSymlinkTraversal(targetRoot, absolute);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) continue;
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (entry.isFile()) candidates.push(`${directory}/${entry.name}`);
    }
  }
  return candidates;
}

function importInstructions(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const importedPath = resolveInside(targetRoot, IMPORTED_FILE);
  assertNoSymlinkTraversal(targetRoot, importedPath);
  const existing = fs.existsSync(importedPath) ? fs.readFileSync(importedPath, 'utf8') : null;

  const build = buildOutputs('all');
  const entryTargets = new Set(build.config.pipelines.map((pipeline) => normalizeRelative(pipeline.installTarget)));

  const imported = [];
  const skipped = [];
  const conflicts = [];
  const sections = [];
  for (const relativePath of collectImportSources(targetRoot)) {
    const absolute = resolveInside(targetRoot, relativePath);
    assertNoSymlinkTraversal(targetRoot, absolute);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
    const content = fs.readFileSync(absolute, 'utf8');
    if (content.includes(GENERATED_MARKER)) {
      skipped.push({ relativePath, reason: 'aeos-generated' });
      continue;
    }
    if (existing && existing.includes(`## From \`${relativePath}\``)) {
      skipped.push({ relativePath, reason: 'already-imported' });
      continue;
    }
    if (entryTargets.has(relativePath)) conflicts.push(relativePath);
    imported.push(relativePath);
    sections.push(`## From \`${relativePath}\`\n\n${content.trim()}\n`);
  }

  let written = false;
  if (sections.length > 0 && !options.dryRun) {
    const header = [
      '# Imported Agent Instructions',
      '',
      'Collected by `aeos import`. These are the repository\'s pre-AEOS agent instructions, preserved verbatim.',
      'In the AEOS precedence order, repository-local instructions rank above AEOS core policy.',
      'Curate freely: delete sections that no longer apply, then run `aeos update` so entries stay current.',
      ''
    ].join('\n');
    const body = sections.join('\n');
    atomicWrite(importedPath, existing ? `${existing.trimEnd()}\n\n${body}` : `${header}\n${body}`);
    written = true;
  }

  return { targetRoot, imported, skipped, conflicts, written, importedFile: IMPORTED_FILE };
}

function eject(options) {
  const targetRoot = resolveTargetRoot(options.targetPath);
  const manifest = readInstallManifest(targetRoot);
  if (!manifest) throw new Error(`AEOS is not installed here (missing ${INSTALL_MANIFEST}); nothing to eject`);

  const backupId = new Date().toISOString().replace(/[:.]/g, '-');
  let backupUsed = false;
  const planned = manifest.files.map((file) => {
    const destination = resolveInside(targetRoot, file.path);
    assertNoSymlinkTraversal(targetRoot, destination);
    if (!fs.existsSync(destination)) return {
      relativePath: file.path, destination, clean: true, action: 'already-missing'
    };
    const clean = sha256(fs.readFileSync(destination, 'utf8')) === file.sha256;
    if (!clean && !options.force) return {
      relativePath: file.path, destination, clean, action: 'kept-modified'
    };
    return { relativePath: file.path, destination, clean, action: 'remove' };
  });
  const results = planned.map(({ relativePath, action }) => ({ relativePath, action }));

  if (!options.dryRun) {
    const manifestPath = resolveInside(targetRoot, INSTALL_MANIFEST);
    for (const entry of planned.filter((item) => item.action === 'remove' && !item.clean)) {
      backupFile(targetRoot, entry.relativePath, entry.destination, backupId);
      backupUsed = true;
    }
    const keptPaths = new Set(results
      .filter((entry) => entry.action === 'kept-modified')
      .map((entry) => entry.relativePath));
    const mutations = planned
      .filter((entry) => entry.action === 'remove')
      .map((entry) => ({
        relativePath: entry.relativePath,
        destination: entry.destination,
        action: 'remove'
      }));
    if (keptPaths.size > 0) {
      const retryManifest = {
        ...manifest,
        files: manifest.files.filter((file) => keptPaths.has(file.path))
      };
      mutations.push({
        relativePath: INSTALL_MANIFEST,
        destination: manifestPath,
        action: 'write',
        content: `${JSON.stringify(retryManifest, null, 2)}\n`
      });
    } else {
      mutations.push({ relativePath: INSTALL_MANIFEST, destination: manifestPath, action: 'remove' });
    }
    applyMutationTransaction(targetRoot, mutations);
  }
  return { targetRoot, results, backupId: backupUsed ? backupId : null };
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = install(options);
    for (const operation of [...result.operations, ...result.pruneResults, ...result.memoryResults]) {
      console.log(`${operation.action.padEnd(13)} ${operation.relativePath}`);
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
  IMPORTED_FILE,
  INSTALL_MANIFEST,
  classifyOperations,
  createOperations,
  diffInstall,
  doctor,
  eject,
  importInstructions,
  install,
  parseArgs,
  parseTargetArgs,
  planInstall,
  update,
  assertNoSymlinkTraversal,
  resolveInside,
  validateInstallManifest
};
