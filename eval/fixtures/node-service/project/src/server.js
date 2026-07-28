const http = require('node:http');
const { createQueue } = require('./queue');

function createServer(queue = createQueue()) {
  return http.createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/jobs') {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', (chunk) => { body += chunk; });
      request.on('end', () => {
        try {
          queue.enqueue(JSON.parse(body));
          response.writeHead(202, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ queued: queue.size() }));
        } catch (error) {
          response.writeHead(400, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }
    response.writeHead(404);
    response.end();
  });
}

if (require.main === module) createServer().listen(Number(process.env.PORT) || 3000);

module.exports = { createServer };
