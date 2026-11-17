const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';
const STATIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Proxy API requests to backend
  if (pathname.startsWith('/api/') || pathname.startsWith('/المنتجات/')) {
    const targetUrl = new URL(req.url, BACKEND_URL);
    const proxyReq = http.request(targetUrl, {
      method: req.method,
      headers: { ...req.headers, host: targetUrl.host }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unreachable', details: err.message }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // 2. Serve static files
  let safePath = path.normalize(path.join(STATIC_DIR, pathname));
  if (!safePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // If path is a directory or root, serve index.html
  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    safePath = path.join(safePath, 'index.html');
  }

  // SPA fallback: If file doesn't exist and not an asset, fallback to index.html
  if (!fs.existsSync(safePath)) {
    if (!path.extname(pathname)) {
      safePath = path.join(STATIC_DIR, 'index.html');
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  const ext = path.extname(safePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });

  fs.createReadStream(safePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 AlAhlam Web Store is running on http://localhost:${PORT}`);
  console.log(`🔗 Proxied to backend: ${BACKEND_URL}`);
});

