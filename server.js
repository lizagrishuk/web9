const http = require('http');
const zlib = require('zlib');

const LOGIN = 'lizagrishuk'; // замени на свой логин в системе

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(LOGIN);
    return;
  }

  if (req.method === 'POST' && req.url === '/zipper') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);

      // ищем файл в multipart/form-data
      const boundary = req.headers['content-type'].split('boundary=')[1];
      const boundaryBuf = Buffer.from('--' + boundary);

      // находим начало и конец данных файла
      const bodyStr = body.toString('binary');
      const headerEnd = bodyStr.indexOf('\r\n\r\n') + 4;
      const fileStart = headerEnd;
      const fileEnd = body.length - boundaryBuf.length - 8; // --boundary--\r\n

      const fileData = body.slice(fileStart, fileEnd);

      zlib.gzip(fileData, (err, compressed) => {
        if (err) {
          res.writeHead(500);
          res.end('gzip error');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'application/gzip',
          'Content-Disposition': 'attachment; filename="result.gz"',
          'Content-Length': compressed.length
        });
        res.end(compressed);
      });
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`running on port ${PORT}`));
