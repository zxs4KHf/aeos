const test = require('node:test');
const assert = require('node:assert/strict');

const { formatTask, normalizeTitle } = require('../src/tasks');

test('formats open and completed tasks', () => {
  assert.equal(formatTask({ title: 'Ship', done: false }), '[ ] Ship');
  assert.equal(formatTask({ title: 'Ship', done: true }), '[x] Ship');
});

test('removes leading whitespace from titles', () => {
  assert.equal(normalizeTitle('  Ship'), 'Ship');
});

test('rejects invalid tasks', () => {
  assert.throws(() => formatTask({ title: '', done: false }), /title is required/);
  assert.throws(() => formatTask({ title: 'Ship' }), /done must be a boolean/);
});
