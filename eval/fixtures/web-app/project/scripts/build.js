const { renderPage } = require('../src/app');

const output = renderPage([{ title: 'AEOS', description: 'Evaluation fixture' }]);
if (!output.startsWith('<!doctype html>') || !output.includes('<main>')) {
  throw new Error('build output is invalid');
}
console.log(`Build check passed (${Buffer.byteLength(output)} bytes).`);
