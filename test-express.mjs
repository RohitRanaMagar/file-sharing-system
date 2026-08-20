import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const upload = multer({ dest: 'uploads/' });

const app = express();

// CSRF middleware BEFORE multer
app.use((req, res, next) => {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();
  
  console.log('=== CSRF Middleware ===');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', req.body);
  
  const token = req.headers['csrf-token'] || req.body?._csrf;
  if (!token) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }
  console.log('Token found:', token);
  next();
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file });
});

const server = app.listen(3457, async () => {
  const form = new FormData();
  form.append('file', Buffer.from('test'), 'test.txt');
  try {
    await axios.post('http://localhost:3457/upload', form, {
      headers: {
        ...form.getHeaders(),
        'CSRF-Token': 'test-token-123'
      }
    });
    console.log('Upload succeeded!');
  } catch (e) {
    console.log('Upload failed:', e.response?.data || e.message);
  }
  server.close();
});