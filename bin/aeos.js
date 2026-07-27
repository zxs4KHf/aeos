#!/usr/bin/env node
const compiler = require('../adapters/compiler');
const integrator = require('../adapters/integrator');
const packageJson = require('../package.json');

const USAGE = `AEOS ${packageJson.version} — agent-agnostic engineering policy compiler

Usage: aeos <command> [options]

Repository commands (run inside the AEOS repository):
  build   [--platform <name>|all]   Render native platform entries into dist/
  check   [--platform <name>|all]   Verify committed dist/ output matches the policy source

Target-project commands:
  init    --path <dir> --platform <name>|all [--dry-run] [--force] [--no-knowledge]
                                    Install AEOS into a target project
  import  --path <dir> [--dry-run]  Collect existing agent instruction files into .aeos/IMPORTED.md
  update  --path <dir> [--dry-run] [--force]
                                    Refresh all previously installed platforms and prune orphans
  doctor  --path <dir> [--strict]   Diagnose managed files; strict also fails when updates are pending
  diff    --path <dir>              Preview exactly what update would change
  eject   --path <dir> [--dry-run] [--force]
                                    Remove AEOS-managed files (project facts in .aeos/ are kept)

  help                              Show this message
  version                           Print the AEOS version
`;

function printOperations(operations) {
  for (const operation of operations) {
    console.log(`${operation.action.padEnd(14)} ${operation.relativePath}`);
  }
}

function parseBuildArgs(argv) {
  let platform = 'all';
  for (let index = 0; index < argv.length; index += 1) {
    if (['--platform', '-p'].includes(argv[index])) {
      if (!argv[index + 1]) throw new Error(`${argv[index]} requires a value`);
      platform = argv[index + 1].toLowerCase();
      index += 1;
    } else {
      throw new Error(`unknown argument: ${argv[index]}`);
    }
  }
  return platform;
}

function runBuild(argv) {
  const build = compiler.buildOutputs(parseBuildArgs(argv));
  compiler.writeOutputs(build);
  for (const output of build.outputs) {
    console.log(`Built ${output.pipeline.platform}: ${output.pipeline.target} (${output.lineCount} lines)`);
  }
}

function runCheck(argv) {
  const build = compiler.buildOutputs(parseBuildArgs(argv));
  const drift = compiler.checkOutputs(build);
  if (drift.length > 0) throw new Error(`generated output is stale: ${drift.join(', ')}`);
  console.log(`AEOS check passed for ${build.outputs.length} platform(s).`);
}

function runInit(argv) {
  const options = integrator.parseTargetArgs(argv, { requirePlatform: true });
  const result = integrator.install(options);
  printOperations([...result.operations, ...result.pruneResults, ...result.memoryResults]);
  if (result.backupId && !options.dryRun) console.log(`Backed up conflicts to .aeos/backups/${result.backupId}/`);
  console.log(options.dryRun ? 'Dry run complete; no files were changed.' : `AEOS installed in ${result.targetRoot}`);
}

function runImport(argv) {
  const options = integrator.parseTargetArgs(argv, { allowPlatform: false });
  const result = integrator.importInstructions(options);
  for (const relativePath of result.imported) console.log(`import         ${relativePath}`);
  for (const entry of result.skipped) console.log(`skip (${entry.reason.padEnd(16)}) ${entry.relativePath}`);
  if (result.imported.length === 0) {
    console.log('No new agent instruction files found to import.');
    return;
  }
  if (options.dryRun) {
    console.log('Dry run complete; no files were changed.');
    return;
  }
  console.log(`Imported ${result.imported.length} file(s) into ${result.importedFile}. Originals were left in place.`);
  if (result.conflicts.length > 0) {
    console.log(`These originals occupy AEOS entry paths and will conflict with init: ${result.conflicts.join(', ')}`);
    console.log('Review the imported copy, then re-run init with --force (originals are backed up) or remove them manually.');
  }
  console.log('Run `aeos init` or `aeos update` so entry files link the imported instructions.');
}

function runUpdate(argv) {
  const options = integrator.parseTargetArgs(argv, { allowPlatform: false });
  const result = integrator.update(options);
  printOperations([...result.operations, ...result.pruneResults, ...result.memoryResults]);
  if (result.droppedPlatforms.length > 0) {
    console.log(`Dropped unknown platforms from the manifest: ${result.droppedPlatforms.join(', ')}`);
  }
  if (result.backupId && !options.dryRun) console.log(`Backed up conflicts to .aeos/backups/${result.backupId}/`);
  console.log(options.dryRun ? 'Dry run complete; no files were changed.' : `AEOS updated in ${result.targetRoot}`);
}

function runDoctor(argv) {
  const options = integrator.parseTargetArgs(argv, { allowPlatform: false });
  const report = integrator.doctor(options);
  if (options.json) {
    console.log(JSON.stringify({
      aeosVersion: report.aeosVersion,
      platforms: report.platforms,
      healthy: report.healthy,
      updatesPending: report.updatesPending,
      entries: report.entries
    }, null, 2));
    if (!report.healthy || (options.strict && report.updatesPending)) process.exitCode = 1;
    return;
  }
  console.log(`AEOS ${report.aeosVersion} installed for: ${report.platforms.join(', ')}`);
  for (const entry of report.entries) {
    if (entry.status === 'ok') continue;
    console.log(`${entry.status.padEnd(18)} ${entry.relativePath}`);
  }
  const okCount = report.entries.filter((entry) => entry.status === 'ok').length;
  console.log(`${okCount}/${report.entries.length} managed files are healthy and current.`);
  if (report.updatesPending) console.log('Updates are pending; run `aeos update --path <dir>` to apply them.');
  if (!report.healthy) {
    console.log('Issues found. Review modified/missing/orphaned files before updating (use diff to preview).');
  }
  if (options.strict && report.updatesPending) console.log('Strict mode: pending updates fail this check.');
  if (!report.healthy || (options.strict && report.updatesPending)) process.exitCode = 1;
}

function runDiff(argv) {
  const options = integrator.parseTargetArgs(argv, { allowPlatform: false });
  const result = integrator.diffInstall(options);
  if (options.json) {
    console.log(JSON.stringify({
      operations: result.operations.map((operation) => ({ path: operation.relativePath, action: operation.action })),
      orphans: result.orphans.map((orphan) => ({ path: orphan.relativePath, action: orphan.action })),
      droppedPlatforms: result.droppedPlatforms
    }, null, 2));
    return;
  }
  const pending = result.operations.filter((operation) => operation.action !== 'unchanged');
  printOperations(pending);
  printOperations(result.orphans);
  if (pending.length === 0 && result.orphans.length === 0) {
    console.log('Install is current; update would change nothing.');
  } else {
    console.log(`${pending.length + result.orphans.length} change(s) pending; run \`aeos update --path <dir>\` to apply.`);
  }
}

function runEject(argv) {
  const options = integrator.parseTargetArgs(argv, { allowPlatform: false });
  const result = integrator.eject(options);
  printOperations(result.results);
  const kept = result.results.filter((entry) => entry.action === 'kept-modified');
  if (kept.length > 0) console.log(`Kept ${kept.length} modified file(s); re-run with --force to remove them too.`);
  if (result.backupId && !options.dryRun) console.log(`Backed up modified files to .aeos/backups/${result.backupId}/`);
  console.log(options.dryRun ? 'Dry run complete; no files were changed.' : `AEOS ejected from ${result.targetRoot}`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  try {
    switch (command) {
      case 'build': return runBuild(rest);
      case 'check': return runCheck(rest);
      case 'init':
      case 'install': return runInit(rest);
      case 'import': return runImport(rest);
      case 'update': return runUpdate(rest);
      case 'doctor': return runDoctor(rest);
      case 'diff': return runDiff(rest);
      case 'eject': return runEject(rest);
      case 'version':
      case '--version':
      case '-v': return console.log(packageJson.version);
      case undefined:
      case 'help':
      case '--help':
      case '-h': return console.log(USAGE);
      default: throw new Error(`unknown command: ${command}\n\n${USAGE}`);
    }
  } catch (error) {
    console.error(`AEOS error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
