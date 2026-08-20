const http = require('http');
const server = http.createServer((req, res) => {
  console.log('Headers received:', JSON.stringify(req.headers, null, 2));
  res.end('ok');
});
server.listen(3456, () => {
  const axios = require('axios');
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', Buffer.from('test'), 'test.txt');
  axios.post('http://localhost:3456/upload', form, {
    headers: {
      ...form.getHeaders(),
      'CSRF-Token': 'test-token-123'
    }
  }).then(() => server.close()).catch(() => server.close());
});