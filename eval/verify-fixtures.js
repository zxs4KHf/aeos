#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const FIXTURES_ROOT = path.join(__dirname, 'fixtures');

function executable(command) {
  return command === 'node' ? process.execPath : command;
}

function loadFixtureDirectories() {
  return fs.readdirSync(FIXTURES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(FIXTURES_ROOT, entry.name))
    .filter((directory) => fs.existsSync(path.join(directory, 'fixture.json')))
    .sort();
}

function verifyFixture(directory) {
  const definition = JSON.parse(fs.readFileSync(path.join(directory, 'fixture.json'), 'utf8'));
  const tasks = JSON.parse(fs.readFileSync(path.join(directory, 'tasks.json'), 'utf8'));
  if (definition.schemaVersion !== 1 || definition.name !== tasks.fixture) {
    throw new Error(`fixture identity mismatch in ${directory}`);
  }
  if (!Array.isArray(tasks.tasks) || tasks.tasks.length < 5) {
    throw new Error(`${definition.name} must define at least five evaluation tasks`);
  }
  if (new Set(tasks.tasks.map((task) => task.id)).size !== tasks.tasks.length) {
    throw new Error(`${definition.name} contains duplicate task IDs`);
  }
  const project = path.join(directory, 'project');
  for (const check of definition.verify) {
    if (!check.command || !Array.isArray(check.args)) throw new Error(`invalid verify command in ${directory}`);
    const result = spawnSync(executable(check.command), check.args, {
      cwd: project,
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' }
    });
    if (result.status !== 0) {
      const details = result.error?.message || `${result.stdout || ''}${result.stderr || ''}`;
      throw new Error(`${definition.name}: ${check.command} ${check.args.join(' ')} failed\n${details}`);
    }
  }
  return { name: definition.name, tasks: tasks.tasks.length, checks: definition.verify.length };
}

function main() {
  try {
    const results = loadFixtureDirectories().map(verifyFixture);
    for (const result of results) {
      console.log(`Verified ${result.name}: ${result.tasks} tasks, ${result.checks} baseline check(s).`);
    }
  } catch (error) {
    console.error(`AEOS fixture error: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { loadFixtureDirectories, verifyFixture };
