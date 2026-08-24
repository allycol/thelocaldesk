// Custom server so the app binds explicitly to process.env.PORT and 0.0.0.0,
// as required by GoDaddy's Node.js Hosting environment. `next start` alone
// leaves the bind address to Next's defaults, which this makes unambiguous.
const { createServer } = require('node:http');
const next = require('next');

const port = Number(process.env.PORT) || 3000;
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> thelocaldesk.au ready on http://${hostname}:${port}`);
  });
});
