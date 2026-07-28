const test = require('node:test');
const assert = require('node:assert/strict');

const { escapeText, renderCard } = require('../src/card');
const { renderPage } = require('../src/app');

test('escapes markup in card text', () => {
  assert.equal(escapeText('<b>'), '&lt;b&gt;');
  assert.match(renderCard({ title: '<Title>', description: 'Safe' }), /&lt;Title&gt;/);
});

test('renders a page of cards', () => {
  const page = renderPage([{ title: 'One' }, { title: 'Two' }]);
  assert.equal((page.match(/class="card"/g) || []).length, 2);
});

test('rejects invalid card input', () => {
  assert.throws(() => renderCard({ title: '' }), /title is required/);
  assert.throws(() => renderPage(null), /cards must be an array/);
});
