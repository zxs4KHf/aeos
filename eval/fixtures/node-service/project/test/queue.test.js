const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');

const { createQueue } = require('../src/queue');
const { createServer } = require('../src/server');

test('queues jobs in FIFO order', () => {
  const queue = createQueue();
  assert.equal(queue.enqueue({ id: 'one' }), 1);
  assert.equal(queue.enqueue({ id: 'two' }), 2);
  assert.equal(queue.next().id, 'one');
  assert.equal(queue.size(), 1);
});

test('rejects malformed jobs', () => {
  assert.throws(() => createQueue().enqueue({}), /job id is required/);
});

test('accepts jobs over HTTP', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    const response = await new Promise((resolve, reject) => {
      const request = http.request({
        hostname: '127.0.0.1',
        port: address.port,
        path: '/jobs',
        method: 'POST',
        headers: { 'content-type': 'application/json' }
      }, resolve);
      request.on('error', reject);
      request.end(JSON.stringify({ id: 'http-one' }));
    });
    response.resume();
    assert.equal(response.statusCode, 202);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
