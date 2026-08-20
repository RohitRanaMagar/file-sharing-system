import http from 'http';
import axios from 'axios';
import FormData from 'form-data';

const server = http.createServer((req, res) => {
  console.log('Headers received:', JSON.stringify(req.headers, null, 2));
  res.end('ok');
});

server.listen(3456, async () => {
  const form = new FormData();
  form.append('file', Buffer.from('test'), 'test.txt');
  try {
    await axios.post('http://localhost:3456/upload', form, {
      headers: {
        ...form.getHeaders(),
        'CSRF-Token': 'test-token-123'
      }
    });
  } catch (e) {}
  server.close();
});