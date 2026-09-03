import http from 'node:http';

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NexaCloud API Running');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
